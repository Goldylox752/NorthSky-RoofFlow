export async function sendEmail({ to, template }) {
  console.log("sending email", to, template);
  return true;
}