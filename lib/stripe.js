import Stripe from "stripe";


/**
 * Stripe server client
 */
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY,
  {
    apiVersion: "2024-06-20",
  }
);



/**
 * RoofFlow subscription plans
 */
export const ROOFFLOW_PLANS = {

  starter: {
    name: "RoofFlow Starter",
    amount: 49900,
  },

  growth: {
    name: "RoofFlow Growth",
    amount: 99900,
  },

  domination: {
    name: "RoofFlow Domination",
    amount: 199900,
  },

};




/**
 * Create Stripe customer
 */
export async function createCustomer({
  email,
  name,
}) {

  return stripe.customers.create({
    email,
    name,
  });

}





/**
 * Create subscription checkout
 */
export async function createCheckoutSession({
  customerId,
  plan,
  contractorId,
}) {


const selectedPlan =
ROOFFLOW_PLANS[plan];



if(!selectedPlan){

throw new Error(
"Invalid RoofFlow plan"
);

}



return stripe.checkout.sessions.create({

mode:"subscription",


customer:customerId,



line_items:[

{

price_data:{

currency:"usd",

product_data:{
name:selectedPlan.name,
},


recurring:{
interval:"month",
},


unit_amount:selectedPlan.amount,

},


quantity:1,

},

],



success_url:
`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,



cancel_url:
`${process.env.NEXT_PUBLIC_APP_URL}/pricing`,



metadata:{

contractorId,

plan,

},


});

}





/**
 * Retrieve subscription
 */
export async function getSubscription(
subscriptionId
){

return stripe.subscriptions.retrieve(
subscriptionId
);

}





/**
 * Cancel subscription
 */
export async function cancelSubscription(
subscriptionId
){

return stripe.subscriptions.cancel(
subscriptionId
);

}





/**
 * Verify webhook signature
 */
export function constructStripeEvent(
body,
signature
){

return stripe.webhooks.constructEvent(
body,
signature,
process.env.STRIPE_WEBHOOK_SECRET
);

}