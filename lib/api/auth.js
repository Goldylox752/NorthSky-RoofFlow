const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://your-backend.com";

// =====================
// CORE REQUEST WRAPPER
// =====================
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // cookies/session support
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.error || data?.message || (await res.text().catch(() => "Request failed"));
    throw new Error(message);
  }

  return data;
}

// =====================
// AUTH: GET CURRENT USER
// =====================
export async function getMe() {
  return request("/auth/me");
}

// =====================
// LOGIN
// =====================
export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password required");
  }

  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// =====================
// SIGNUP
// =====================
export async function signup({ email, password, name }) {
  if (!email || !password) {
    throw new Error("Email and password required");
  }

  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

// =====================
// LOGOUT
// =====================
export async function logout() {
  return request("/auth/logout", {
    method: "POST",
  });
}