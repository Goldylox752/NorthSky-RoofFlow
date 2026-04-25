import { rateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  if (!rateLimit(ip)) {
    return new Response("Too many requests", { status: 429 });
  }

  // scraper logic here
}

const requestMap = new Map();

export function rateLimit(ip, limit = 10, windowMs = 60000) {
  const now = Date.now();

  if (!requestMap.has(ip)) {
    requestMap.set(ip, []);
  }

  const timestamps = requestMap.get(ip);

  const filtered = timestamps.filter((t) => now - t < windowMs);

  if (filtered.length >= limit) {
    return false;
  }

  filtered.push(now);
  requestMap.set(ip, filtered);

  return true;
}
