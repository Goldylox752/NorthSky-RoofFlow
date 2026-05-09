import { safeFetch } from "./client";

/* ===============================
   SIGNUP
=============================== */
export async function signup(payload: {
  email: string;
  password?: string;
  name?: string;
}) {
  return safeFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ===============================
   LOGIN
=============================== */
export async function login(payload: {
  email: string;
  password?: string;
}) {
  return safeFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ===============================
   LOGOUT
=============================== */
export async function logout() {
  return safeFetch("/api/auth/logout", {
    method: "POST",
  });
}

/* ===============================
   GET CURRENT USER
=============================== */
export async function getMe() {
  return safeFetch("/api/auth/me");
}