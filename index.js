window.NorthSkyOS = {
  track(event, data) {
    fetch("https://your-api.com/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        data,
        session: localStorage.getItem("ns_session_id"),
        user: localStorage.getItem("ns_user_id"),
        score: localStorage.getItem("ns_score"),
        url: location.href
      })
    });
  },

  route(score) {
    if (score >= 15) {
      window.location.href = "https://goldylox752.github.io/RoofFlow-AI/";
    }
  }
};




/* =========================================
   NORTHSKY AI - SECURE ENGINE
   index.js (AUTH + PAYMENT VERIFIED)
========================================= */

/* ========== CONFIG ========== */
const CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_URL",
  SUPABASE_KEY: "YOUR_SUPABASE_ANON_KEY",
  DRONE_URL: "https://northsky-drones.vercel.app"
};

let supabase = null;
let currentUser = null;

/* ========== INIT ========== */
(async function init() {

  if (!window.supabase) {
    console.error("❌ Supabase not loaded");
    return;
  }

  supabase = window.supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_KEY
  );

  console.log("✅ Supabase connected");

  // check auth session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("🔒 No user session");
    return; // user not logged in
  }

  currentUser = user;

  console.log("👤 Logged in:", user.email);

  // verify paid access
  const { data, error } = await supabase
    .from("users")
    .select("paid, plan")
    .eq("email", user.email)
    .single();

  if (error || !data || !data.paid) {
    console.warn("🚫 No paid access");
    return;
  }

  console.log("🔓 Paid access confirmed:", data.plan);

  // unlock UI
  const paywall = document.getElementById("paywall");
  const app = document.getElementById("app");

  if (paywall) paywall.style.display = "none";
  if (app) app.classList.remove("hidden");

  // expose submit only AFTER auth
  window.submitLead = submitLead;

})();
    

/* ========== SESSION (OPTIONAL TRACKING) ========== */
function sessionId() {
  let id = localStorage.getItem("session_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("session_id", id);
  }

  return id;
}


/* ========== LOGIN (MAGIC LINK) ========== */
async function login(email) {

  if (!email) {
    alert("Enter email");
    return;
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: email
  });

  if (error) {
    alert("Login failed");
    console.error(error);
    return;
  }

  alert("Check your email for login link");
}

window.login = login;


/* ========== LEAD SUBMIT (SECURE) ========== */
async function submitLead() {

  if (!currentUser) {
    alert("You must be logged in");
    return;
  }

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const cityEl = document.getElementById("city");

  if (!nameEl || !emailEl || !cityEl) {
    alert("Missing form fields");
    return;
  }

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const city = cityEl.value.trim();

  if (!name || !email || !city) {
    alert("Fill all fields");
    return;
  }

  const payload = {
    name,
    email,
    city,
    user_email: currentUser.email,
    session_id: sessionId(),
    created_at: new Date().toISOString()
  };

  console.log("📩 Lead captured", payload);

  const { error } = await supabase.from("leads").insert([payload]);

  if (error) {
    console.error("❌ Insert failed", error);
    alert("Error submitting. Try again.");
    return;
  }

  console.log("✅ Lead saved");

  // redirect to drone upsell
  setTimeout(() => {
    window.location.href = CONFIG.DRONE_URL + "?bundle=inspection-kit";
  }, 800);
}