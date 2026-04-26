// ===============================
// 🌐 FLOW OS API CLIENT (SINGLE SOURCE OF TRUTH)
// ===============================

const FLOW_API =
  process.env.NEXT_PUBLIC_FLOW_API ||
  "https://northsky-flow-os.onrender.com";

// ===============================
// 🔧 CORE REQUEST ENGINE
// ===============================
async function request(url, options = {}) {
  try {
    const res = await fetch(`${FLOW_API}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data?.error || `HTTP ${res.status}`,
      };
    }

    return {
      success: true,
      data,
    };

  } catch (err) {
    return {
      success: false,
      error: err.message || "Network error",
    };
  }
}

// ===============================
// 📩 LEADS
// ===============================
export const createLead = (data) =>
  request("/api/leads", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getLeads = () =>
  request("/api/leads");

// ===============================
// 🧾 JOBS
// ===============================
export const createJob = (data) =>
  request("/api/jobs", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getJobs = () =>
  request("/api/jobs");

// ===============================
// 💰 QUOTES
// ===============================
export const createQuote = (data) =>
  request("/api/quotes", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ===============================
// 🔥 AUCTIONS (ADDED)
// ===============================
export const createAuction = (data) =>
  request("/api/auction/create", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const placeBid = (data) =>
  request("/api/auction/bid", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const closeAuction = (data) =>
  request("/api/auction/close", {
    method: "POST",
    body: JSON.stringify(data),
  });