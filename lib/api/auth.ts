// lib/api/auth.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://your-backend.com";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // for cookies/session
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMe() {
  return request("/auth/me");
}

export async function login(data: { email: string; password: string }) {
  return request("/auth/login", { method: "POST", body: JSON.stringify(data) });
}

export async function signup(data: { email: string; password: string; name?: string }) {
  return request("/auth/signup", { method: "POST", body: JSON.stringify(data) });
}

export async function logout() {
  return request("/auth/logout", { method: "POST" });
}