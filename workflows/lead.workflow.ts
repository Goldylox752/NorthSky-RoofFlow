import { qualificationAgent } from "../agents/qualification.agent";
import { salesAgent } from "../agents/sales.agent";

export async function leadWorkflow(lead) {
  try {
    if (!lead) return null;

    const qualified = await qualificationAgent(lead);

    if (!qualified) return null;

    const result = await salesAgent(lead);

    return result;
  } catch (err) {
    console.error("[leadWorkflow] error:", err);
    return null;
  }
}