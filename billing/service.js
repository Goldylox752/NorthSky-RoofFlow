const supabase = require("../lib/supabase");

/* ===============================
   HANDLE PAID CHECKOUT
=============================== */
async function handleCheckoutCompleted(session) {
  const email =
    session.customer_details?.email ||
    session.customer_email;

  if (!email) return;

  await supabase.from("leads").upsert({
    email: email.toLowerCase().trim(),
    stripe_customer_id: session.customer,
    stripe_session_id: session.id,
    paid: true,
    status: "paid",
    plan: session.metadata?.plan || null,
    updated_at: new Date().toISOString(),
  });
}

/* ===============================
   HANDLE INVOICE PAID (SUBSCRIPTION)
=============================== */
async function handleInvoicePaid(invoice) {
  const email = invoice.customer_email;

  if (!email) return;

  await supabase
    .from("leads")
    .update({
      paid: true,
      status: "active",
      stripe_customer_id: invoice.customer,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email.toLowerCase().trim());
}

module.exports = {
  handleCheckoutCompleted,
  handleInvoicePaid,
};