// jobs/lead.ingestor.js

const { createLead } = require("../modules/leads/lead.service");

/**
 * Example ingestion (replace later with scraper/API/webhooks)
 */
async function ingestLead(raw) {
  try {
    const lead = await createLead({
      title: raw.title,
      description: raw.description,
      email: raw.email,
      phone: raw.phone,
      city: raw.city,
      category: raw.category,
    });

    console.log("New lead ingested:", lead.id);

    return lead;
  } catch (err) {
    console.error("Lead ingestion error:", err);
  }
}

/**
 * Example test run
 */
async function run() {
  await ingestLead({
    title: "Roof replacement needed",
    description: "Customer needs new roof in 2 weeks",
    email: "test@email.com",
    phone: "555-1234",
    city: "Calgary",
    category: "roofing",
  });
}

run();