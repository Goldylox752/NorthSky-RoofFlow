const { createLead } = require("../modules/leads/lead.service");

/* ===============================
   CORE INGEST FUNCTION
=============================== */
async function ingestLead(raw) {
  try {
    const lead = await createLead({
      name: raw.title,
      email: raw.email,
      phone: raw.phone,
      city: raw.city,
      category: raw.category,
      source: "ingestion",
    });

    console.log("✔ Lead ingested:", lead?.id || "duplicate");

    return lead;
  } catch (err) {
    console.error("❌ Ingest error:", err.message);
  }
}

/* ===============================
   TEST / BATCH RUN
=============================== */
async function runIngestJob() {
  const testLeads = [
    {
      title: "Roof replacement needed",
      email: "test@email.com",
      phone: "555-1234",
      city: "Calgary",
      category: "roofing",
    },
  ];

  for (const raw of testLeads) {
    await ingestLead(raw);
  }

  console.log("Ingest job complete");
}

module.exports = { runIngestJob };