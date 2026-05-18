// /server/dispatch/dispatchLead.ts

import { supabase } from "@/lib/supabase";
import { pickContractor } from "./pickContractor";
import { calculateLeadPrice } from "../engines/pricing.engine";
import { leadQueue } from "../queues/lead.queue";

// ── Types ─────────────────────────────────────────────────────────────────────

type Lead = {
  id: string;
  city?: string;
  score?: number;
  tier?: "HOT" | "WARM" | "COLD";
  intent?: string;
  source?: string;
  text?: string;
  metadata?: Record<string, unknown>;
};

type Contractor = {
  id: string;
  plan?: "starter" | "growth" | "elite";
  verified?: boolean;
};

type SystemMetrics = {
  demandMultiplier?: number;
  surgeActive?: boolean;
};

type DispatchInput = {
  lead: Lead;
  contractors: Contractor[];
  systemMetrics?: SystemMetrics;
};

type DispatchResult = {
  success: true;
  leadId: string;
  contractorId: string;
  assignedAt: string;
  pricedAt: number;
  tier: string;
  intent: string;
} | {
  success: false;
  reason: string;
  leadId?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const DISPATCH_TIMEOUT_MS = 8_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Dispatch timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function fetchCityRow(city: string) {
  const { data } = await supabase
    .from("cities")
    .select("capacity, active_contractors, market")
    .eq("city", city)
    .single();
  return data ?? { capacity: 1, active_contractors: 0, market: city };
}

async function logDispatchEvent(
  leadId: string,
  contractorId: string,
  price: number,
  success: boolean,
  reason?: string
) {
  await supabase.from("dispatch_log").insert({
    lead_id:       leadId,
    contractor_id: contractorId,
    final_price:   price,
    success,
    reason:        reason ?? null,
    logged_at:     new Date().toISOString(),
  });
}

// ── Main Dispatch ─────────────────────────────────────────────────────────────

export async function dispatchLead({
  lead,
  contractors,
  systemMetrics = {},
}: DispatchInput): Promise<DispatchResult> {

  // ── Validate ───────────────────────────────────────────────────────────────
  if (!lead?.id) {
    return { success: false, reason: "Lead missing ID" };
  }

  if (!contractors?.length) {
    return { success: false, reason: "No contractors provided", leadId: lead.id };
  }

  const city = lead.city ?? "global";

  try {
    // ── Pick contractor ──────────────────────────────────────────────────────
    const contractor = await withTimeout(
      pickContractor(city, contractors),
      DISPATCH_TIMEOUT_MS
    );

    if (!contractor?.id) {
      return { success: false, reason: "No eligible contractor found", leadId: lead.id };
    }

    // ── Price the lead ───────────────────────────────────────────────────────
    const cityRow = await fetchCityRow(city);

    const pricing = calculateLeadPrice({
      lead:          { id: lead.id, score: lead.score },
      contractor:    { id: contractor.id, plan: contractor.plan },
      cityRow,
      systemMetrics: {
        demandMultiplier: systemMetrics.demandMultiplier ?? 1,
        surgeActive:      systemMetrics.surgeActive ?? false,
      },
    });

    // ── Atomic assignment (status guard) ─────────────────────────────────────
    const assignedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("leads")
      .update({
        status:                 "assigned",
        assigned_contractor_id: contractor.id,
        assigned_at:            assignedAt,
        final_price:            pricing.finalPrice,
        price_breakdown:        pricing.breakdown,
        tier:                   lead.tier ?? null,
        intent:                 lead.intent ?? null,
      })
      .eq("id", lead.id)
      .eq("status", "pending")       // atomic guard — prevents double assignment
      .select()
      .single();

    if (error || !data) {
      return {
        success: false,
        reason:  error?.message ?? "Assignment failed or lead already taken",
        leadId:  lead.id,
      };
    }

    // ── Increment contractor load ────────────────────────────────────────────
    await supabase.rpc("increment_contractor_load", {
      contractor_id: contractor.id,
    });

    
