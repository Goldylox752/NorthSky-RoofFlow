import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";


const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY,
  {
    apiVersion:"2024-06-20",
  }
);



const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



function env(key){

  const value = process.env[key];

  if(!value){
    throw new Error(`Missing env: ${key}`);
  }

  return value;

}



const now = () =>
new Date().toISOString();





/*
=================================
CHECKOUT COMPLETED
=================================
*/

async function handleCheckoutCompleted(session){


const contractorId =
session.metadata?.contractorId;


const plan =
session.metadata?.plan;



if(!contractorId){

throw new Error(
"Missing contractorId metadata"
);

}



await supabase
.from("contractors")
.update({

subscription_status:"active",

stripe_customer_id:
session.customer,

subscription_id:
session.subscription,

plan:

plan || "starter",

updated_at:
now(),

})

.eq(
"id",
contractorId
);


}







/*
=================================
PAYMENT FAILED
=================================
*/

async function handlePaymentFailed(invoice){


await supabase
.from("contractors")
.update({

subscription_status:
"past_due",

updated_at:
now(),

})

.eq(
"stripe_customer_id",
invoice.customer
);


}








/*
=================================
SUBSCRIPTION UPDATED
=================================
*/

async function handleSubscriptionChange(sub){



const statusMap = {

active:"active",

trialing:"trialing",

past_due:"past_due",

unpaid:"suspended",

canceled:"cancelled",

};



await supabase
.from("contractors")
.update({

subscription_status:
statusMap[sub.status] ?? "unknown",


stripe_customer_id:
sub.customer,


subscription_id:
sub.id,


updated_at:
now(),

})

.eq(
"stripe_customer_id",
sub.customer
);



}









/*
=================================
SUBSCRIPTION CANCELLED
=================================
*/

async function handleSubscriptionDeleted(sub){


await supabase
.from("contractors")
.update({

subscription_status:
"cancelled",

updated_at:
now(),

})

.eq(
"stripe_customer_id",
sub.customer
);


}









/*
=================================
WEBHOOK
=================================
*/


export async function POST(req){


try{


const signature =
req.headers.get(
"stripe-signature"
);



const rawBody =
await req.text();



if(!signature){

return new Response(
"Missing Stripe signature",
{
status:400
}
);

}



const event =
stripe.webhooks.constructEvent(

rawBody,

signature,

env(
"STRIPE_WEBHOOK_SECRET"
)

);





switch(event.type){


case "checkout.session.completed":

await handleCheckoutCompleted(
event.data.object
);

break;



case "invoice.payment_failed":

await handlePaymentFailed(
event.data.object
);

break;



case "customer.subscription.updated":

await handleSubscriptionChange(
event.data.object
);

break;



case "customer.subscription.deleted":

await handleSubscriptionDeleted(
event.data.object
);

break;



default:

console.log(
"Unhandled event:",
event.type
);

}




return Response.json({
received:true
});



}catch(error){


console.error(
"Stripe webhook error:",
error
);



return Response.json(
{
success:false,
error:"webhook_failed"
},
{
status:500
}
);


}

}