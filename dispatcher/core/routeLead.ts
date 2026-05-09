export function routeLead(lead, contractors = []) {
  if (!Array.isArray(contractors) || contractors.length === 0) {
    return null;
  }

  /* ===============================
     FILTER VALID CONTRACTORS
  =============================== */
  const valid = contractors.filter((c) => {
    return (
      c &&
      c.isActive !== false &&
      !c.isPaused &&
      typeof c.activeLeads === "number"
    );
  });

  if (!valid.length) return null;

  /* ===============================
     SORT (NO MUTATION)
  =============================== */
  const sorted = [...valid].sort((a, b) => {
    const loadDiff = (a.activeLeads || 0) - (b.activeLeads || 0);

    if (loadDiff !== 0) return loadDiff;

    /* ===============================
       TIE BREAKER (STABILITY)
    =============================== */
    return (a.id || "").localeCompare(b.id || "");
  });

  return sorted[0];
}