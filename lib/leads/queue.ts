import { calculateLeadPrice } from "../engines/pricing.engine";

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_QUEUE_SIZE = 10000;
const MAX_ATTEMPTS = 3;
const EXPIRY_MS = 1000 * 60 * 30; // 30 min

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateQueueId() {
  return `Q-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

function isExpired(lead) {
  return Date.now() - new Date(lead._queuedAt).getTime() > EXPIRY_MS;
}

// ── Queue Class ───────────────────────────────────────────────────────────────

class LeadQueue {
  constructor() {
    this.queue = [];
  }

  // ── Enqueue ───────────────────────────────────────────────────────────────

  enqueue(data) {
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      throw new Error(
        `[lead-queue] Queue full (${MAX_QUEUE_SIZE}). Drain before adding more.`
      );
    }

    if (!data.source || !data.text) {
      throw new Error("[lead-queue] Lead must have source and text");
    }

    const queuedLead = {
      ...data,
      _queueId: generateQueueId(),
      _status: "PENDING",
      _queuedAt: new Date().toISOString(),
      _attempts: 0,
    };

    // Price floor at enqueue time
    if (data.score !== undefined) {
      try {
        const { finalPrice } = calculateLeadPrice({
          lead: { score: data.score },
          contractor: {},
          cityRow: {},
          systemMetrics: {},
        });

        queuedLead._pricedFloor = finalPrice;
      } catch (err) {
        console.warn(
          `[lead-queue] Pricing failed for ${queuedLead._queueId}`
        );
      }
    }

    this.queue.push(queuedLead);

    console.log(
      `[lead-queue] enqueued | id=${queuedLead._queueId} source=${data.source} tier=${data.tier || "?"} floor=$${queuedLead._pricedFloor || "N/A"}`
    );

    return queuedLead;
  }

  // ── Dequeue ───────────────────────────────────────────────────────────────

  dequeue(options = {}) {
    const { limit = 10, tier, intent, status = "PENDING" } = options;

    this.purgeExpired();

    return this.queue
      .filter((lead) => {
        if (lead._status !== status) return false;
        if (tier && lead.tier !== tier) return false;
        if (intent && lead.intent !== intent) return false;
        return true;
      })
      .slice(0, limit);
  }

  // ── Status Updates ────────────────────────────────────────────────────────

  markProcessing(queueId) {
    this.updateStatus(queueId, "PROCESSING");
  }

  markDone(queueId) {
    const lead = this.findById(queueId);
    if (lead) lead._processedAt = new Date().toISOString();
    this.updateStatus(queueId, "DONE");
  }

  markFailed(queueId, error) {
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
      lead._status = "PENDING";
      console.warn(
        `[lead-queue] retrying | id=${queueId} attempt=${lead._attempts}/${MAX_ATTEMPTS}`
      );
    }
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  findById(queueId) {
    return this.queue.find((l) => l._queueId === queueId);
  }

  getAll(status) {
    if (!status) return [...this.queue];
    return this.queue.filter((l) => l._status === status);
  }

  getStats() {
    const byStatus = {
      PENDING: 0,
      PROCESSING: 0,
      DONE: 0,
      FAILED: 0,
      EXPIRED: 0,
    };

    const byTier = {
      HOT: 0,
      WARM: 0,
      COLD: 0,
    };

    const byIntent = {
      SALES: 0,
      BILLING: 0,
      SUPPORT: 0,
      ADMIN: 0,
      USER: 0,
      UNKNOWN: 0,
    };

    let oldestTs = null;

    for (const lead of this.queue) {
      byStatus[lead._status]++;

      if (lead.tier) byTier[lead.tier]++;

      if (lead.intent) {
        byIntent[lead.intent]++;
      } else {
        byIntent.UNKNOWN++;
      }

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

  purgeExpired() {
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

  purgeDone() {
    const before = this.queue.length;
    this.queue = this.queue.filter((l) => l._status !== "DONE");
    return before - this.queue.length;
  }

  clear() {
    this.queue = [];
    console.warn("[lead-queue] queue cleared");
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  updateStatus(queueId, status) {
    const lead = this.findById(queueId);

    if (!lead) {
      console.warn(`[lead-queue] updateStatus: id=${queueId} not found`);
      return;
    }

    lead._status = status;
  }
}

// ── Singleton ────────────────────────────────────────────────────────────────

export const leadQueue = new LeadQueue();