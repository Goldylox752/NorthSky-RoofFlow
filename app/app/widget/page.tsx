const searchParams = useSearchParams();

const site = searchParams.get("site") || "default";

if (!site) {
  throw new Error("Missing site_id");
}

const payload = {
  email,
  phone: cleanedPhone,
  plan,
  lead_score: leadScore,
  site_id: site,
  source: window.location.origin,
};