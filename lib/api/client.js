const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://your-backend.com";

// =====================
// CORE FETCH WRAPPER
// =====================
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
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
      data?.error || data?.message || "Request failed";
    throw new Error(message);
  }

  return data;
}

// =====================
// SDK EXPORT
// =====================
export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body || {}),
    }),
  put: (path, body) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(body || {}),
    }),
  delete: (path) =>
    request(path, { method: "DELETE" }),
};