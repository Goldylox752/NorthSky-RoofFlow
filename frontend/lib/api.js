const API = process.env.NEXT_PUBLIC_API_URL;

if (typeof window !== "undefined" && !API) {
  console.warn("⚠️ Missing NEXT_PUBLIC_API_URL");
}

// =====================
// SAFE JSON PARSE
// =====================
async function safeParse(res: Response) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return res.json();
  }

  return res.text();
}

// =====================
// CORE FETCH WRAPPER (CLERK READY)
// =====================
async function apiFetch(
  path: string,
  options: RequestInit & { getToken?: () => Promise<string | null>; timeout?: number } = {}
) {
  if (!API) throw new Error("API base URL is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeout || 10000
  );

  let token: string | null = null;

  if (options.getToken) {
    token = await options.getToken();
  }

  try {
    const res = await fetch(`${API}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: options.body,
      signal: controller.signal,
    });

    const data = await safeParse(res);

    clearTimeout(timeout);

    if (!res.ok) {
      const error = new Error(
        data?.message || data?.error || `Request failed (${res.status})`
      );

      (error as any).status = res.status;
      (error as any).data = data;

      throw error;
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      throw new Error("⏱ Request timeout — server not responding");
    }

    throw err;
  }
}

// =====================
// API METHODS
// =====================
export const createLead = (payload: any, getToken: any) =>
  apiFetch("/api/leads", {
    method: "POST",
    body: JSON.stringify(payload),
    getToken,
  });

export const getLeads = (getToken: any) =>
  apiFetch("/api/leads", { getToken });

export const scoreLead = (payload: any, getToken: any) =>
  apiFetch("/api/score", {
    method: "POST",
    body: JSON.stringify(payload),
    getToken,
  });

export const createCheckoutSession = (payload: any, getToken: any) =>
  apiFetch("/api/payments/create-session", {
    method: "POST",
    body: JSON.stringify(payload),
    getToken,
  });

export const openBillingPortal = (email: string, getToken: any) =>
  apiFetch("/api/billing/portal", {
    method: "POST",
    body: JSON.stringify({ email }),
    getToken,
  });

export const checkHealth = () => apiFetch("/");