// /server/queues/lead.queue.ts

import { calculateLeadPrice } from "../engines/pricing.engine";

// ── Types ─────────────────────────────────────────────────────────────────────

type LeadSource = "telegram" | "web" | "api" | "manual";
type LeadIntent = "SALES" | "BILLING" | "SUPPORT" | "ADMIN" | "USER";
type LeadTier   = "HOT" | "WARM" | "COLD";
type QueueStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED" | "EXPIRED";

type Lead = {
  id?: string;
  source?: LeadSource;
  chatId?: number | string;
  text?: string;
  score?: number;
  tier?: LeadTier;
  intent?: LeadIntent;
  user?: {
    id?: number | string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  metadata?: Record<string, unknown>;
};

type QueuedLead = Lead & {
  _queueId: string;
  _status: QueueStatus;
  _queuedAt: string;
  _processedAt?: string;
  _attempts: number;
  _error?: string;
  _pricedFloor?: number;
};

type DequeueOptions = {
  limit?: number;
  tier?: LeadTier;
  intent?: LeadIntent;
  status?: QueueStatus;
};

type QueueStats = {
  total: number;
  byStatus: Record<QueueStatus, number>;
  byTier: Record<LeadTier, number>;
  byIntent: Record<LeadIntent | "UNKNOWN", number>;
  oldestPendingAge: number | null;  // ms
};

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_QUEUE_SIZE  = 10_000;
const MAX_ATTEMPTS    = 3;
const EXPIRY_MS       = 1000 * 60 * 30;   // 30 min TTL

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateQueueId(): string {
  return `Q-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function isExpired(lead: QueuedLead): boolean {
  return Date.now() - new Date(lead._queuedAt).getTime() > EXPIRY_MS;
}

// ── Queue Class ───────────────────────────────────────────────────────────────

class LeadQueue {
  private queue: QueuedLead[] = [];

  // ── Enqueue ───────────────────────────────────────────────────────────────

  enqueue(data: Lead): QueuedLead {
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      throw new Error(`[lead-queue] Queue full (${MAX_QUEUE_SIZE} leads). Drain before adding more.`);
    }

    if (!data.source || !data.text) {
      throw new Error("[lead-queue] Lead must have source and text");
    }

    const queuedLead: QueuedLead = {
      ...data,
      _queueId:    generateQueueId(),
      _status:     "PENDING",
      _queuedAt:   new Date().toISOString(),
      _attempts:   0,
    };

    // Price floor at enqueue time — locked in, not recalculated later
    if (data.score !== undefined) {
      try {
        const { finalPrice } = calculateLeadPrice({
          lead:          { score: data.score },
          contractor:    {},
          cityRow:       {},
          systemMetrics: {},
        });
        queuedLead._pricedFloor = finalPrice;
      } catch {
        console.warn(`[lead-queue] Pricing failed for ${queuedLead._queueId}`);
      }
    }

    this.queue.push(queuedLead);

    console.log(
      `[lead-queue] enqueued | id=${queuedLead._queueId} source=${data.source} tier=${data.tier ?? "?"} floor=$${queuedLead._pricedFloor ?? "N/A"}`
    );

    return queuedLead;
  }

  // ── Dequeue ───────────────────────────────────────────────────────────────

  dequeue(options: DequeueOptions = {}): QueuedLead[] {
    const { limit = 10, tier, intent, status = "PENDING" } = options;

    this.purgeExpired();

    return this.queue
      .filter((lead) => {
        if (lead._status !== status)          return false;
        if (tier   && lead.tier   !== tier)   return false;
        if (intent && lead.intent !== intent) return false;
        return true;
      })
      .slice(0, limit);
  }

  // ── Status Updates ────────────────────────────────────────────────────────

  markProcessing(queueId: string): void {
    this.updateStatus(queueId, "PROCESSING");
  }

  markDone(queueId: string): void {
    const lead = this.findById(queueId);
    if (lead) lead._processedAt = new Date().toISOString();
    this.updateStatus(queueId, "DONE");
  }

  markFailed(queueId: string, error: string): void {
    const lead = this.findById(queueId);
    if (!lead) return;

    lead._attempts += 1;
    lead._error = error;

    if (lead._attempts >= MAX_ATTEMPTS) {
      lead._status = "FAILED";
      console.error(
        `[lead-queue] permanently failed | id=${queueId} attempts=${lead._attempts} error=${error}`
      );
    } else {
      lead._status = "PENDING";   // requeue for retry
      console.warn(
        `[lead-queue] retrying | id=${queueId} attempt=${lead._attempts}/${MAX_ATTEMPTS}`
      );
    }
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  findById(queueId: string): QueuedLead | undefined {
    return this.queue.find((l) => l._queueId === queueId);
  }

  getAll(status?: QueueStatus): QueuedLead[] {
    if (!status) return [...this.queue];
    return this.queue.filter((l) => l._status === status);
  }

  getStats(): QueueStats {
    const byStatus  = { PENDING: 0, PROCESSING: 0, DONE: 0, FAILED: 0, EXPIRED: 0 };
    const byTier    = { HOT: 0, WARM: 0, COLD: 0 };
    const byIntent  = { SALES: 0, BILLING: 0, SUPPORT: 0, ADMIN: 0, USER: 0, UNKNOWN: 0 };

    let oldestTs: number | null = null;

    for (const lead of this.queue) {
      byStatus[lead._status]++;
      if (lead.tier)   byTier[lead.tier]++;
      if (lead.intent) byIntent[lead.intent]++;
      else             byIntent["UNKNOWN"]++;

      if (lead._status === "PENDING") {
        const age = new Date(lead._queuedAt).getTime();
        if (!oldestTs || age < oldestTs) oldestTs = age;
      }
    }

    return {
      total: this.queue.length,
      byStatus,
      byTier,
      byIntent,
      oldestPendingAge: oldestTs ? Date.now() - oldestTs : null,
    };
  }

  // ── Maintenance ───────────────────────────────────────────────────────────

  purgeExpired(): number {
    const before = this.queue.length;
    this.queue = this.queue.filter((lead) => {
      if (lead._status === "PENDING" && isExpired(lead)) {
        lead._status = "EXPIRED";
        console.warn(`[lead-queue] expired | id=${lead._queueId}`);
        return false;
      }
      return true;
    });
    return before - this.queue.length;
  }

  purgeDone(): number {
    const before = this.queue.length;
    this.queue = this.queue.filter((l) => l._status !== "DONE");
    return before - this.queue.length;
  }

  clear(): void {
    this.queue = [];
    console.warn("[lead-queue] queue cleared");
  }

  private updateStatus(queueId: string, status: QueueStatus): void {
    const lead = this.findById(queueId);
    if (!lead) {
      console.warn(`[lead-queue] updateStatus: id=${queueId} not found`);
      return;
    }
    lead._status = status;
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

export const leadQueue = new LeadQueue();
