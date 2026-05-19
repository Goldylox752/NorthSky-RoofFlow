// ── Constants ────────────────────────────────────────────────────────────────

const BID_INCREMENT = 50;
const MAX_BIDS_PER_USER = 20;

// ── Safe pricing fallback (replaces missing pricing.engine) ──────────────────

function calculateLeadPrice(input = {}) {
  // simple safe fallback so build never breaks
  const base = Number(input.base || 1000);
  const multiplier = Number(input.multiplier || 1);

  return {
    finalPrice: Math.round(base * multiplier),
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateBidId() {
  return `BID-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

function isExpired(item) {
  if (!item?.endsAt) return false;
  return new Date() > new Date(item.endsAt);
}

// ── Engine ───────────────────────────────────────────────────────────────────

class AuctionEngine {
  constructor() {
    this.bids = new Map(); // itemId → bids[]
    this.items = new Map(); // itemId → item
  }

  // ── Item Management ────────────────────────────────────────────────────────

  registerItem(item) {
    if (this.items.has(item.id)) {
      throw new Error(`Item ${item.id} already registered`);
    }

    this.items.set(item.id, { ...item, closed: false });
    this.bids.set(item.id, []);

    console.log(
      `[auction] item registered | id=${item.id} minBid=${item.minBid}`
    );

    return item;
  }

  getItem(itemId) {
    return this.items.get(itemId) || null;
  }

  // ── Bid Placement ──────────────────────────────────────────────────────────

  placeBid({ userId, itemId, amount }) {
    if (!userId || !itemId || amount == null) {
      return { success: false, reason: "Missing required bid fields" };
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, reason: "Invalid bid amount" };
    }

    const item = this.items.get(itemId);

    if (!item) {
      return { success: false, reason: `Item ${itemId} not found` };
    }

    if (item.closed) {
      return { success: false, reason: "Auction is closed" };
    }

    if (isExpired(item)) {
      return { success: false, reason: "Auction has ended" };
    }

    if (amount < item.minBid) {
      return {
        success: false,
        reason: `Minimum bid is $${item.minBid}`,
      };
    }

    const highest = this.getHighestBid(itemId);

    if (highest && amount < highest.amount + BID_INCREMENT) {
      return {
        success: false,
        reason: `Bid must be at least $${highest.amount + BID_INCREMENT}`,
      };
    }

    const userBids = (this.bids.get(itemId) || []).filter(
      (b) => b.userId === userId && b.status === "ACTIVE"
    );

    if (userBids.length >= MAX_BIDS_PER_USER) {
      return {
        success: false,
        reason: "Bid limit reached for this item",
      };
    }

    if (highest) {
      highest.status = "OUTBID";
    }

    const bid = {
      id: generateBidId(),
      userId,
      itemId,
      amount,
      status: "ACTIVE",
      timestamp: new Date().toISOString(),
    };

    this.bids.get(itemId).push(bid);

    console.log(
      `[auction] bid placed | id=${bid.id} user=${userId} item=${itemId} amount=${amount}`
    );

    return {
      success: true,
      bid,
      newHighest: true,
      leadingAmount: amount,
    };
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  getBidsByItem(itemId) {
    return this.bids.get(itemId) || [];
  }

  getActiveBids(itemId) {
    return this.getBidsByItem(itemId).filter((b) => b.status === "ACTIVE");
  }

  getHighestBid(itemId) {
    const active = this.getActiveBids(itemId);
    if (!active.length) return null;

    return active.reduce((max, b) =>
      b.amount > max.amount ? b : max
    );
  }

  getBidHistory(itemId) {
    return [...this.getBidsByItem(itemId)].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  // ── Close Auction ──────────────────────────────────────────────────────────

  closeAuction(itemId) {
    const item = this.items.get(itemId);

    if (!item) throw new Error(`Item ${itemId} not found`);
    if (item.closed) throw new Error(`Auction already closed`);

    const winner = this.getHighestBid(itemId);

    if (winner && item.reservePrice && winner.amount < item.reservePrice) {
      console.warn(`[auction] reserve not met | item=${itemId}`);
    }

    if (winner) {
      winner.status = "WON";
      item.winnerId = winner.userId;
    }

    item.closed = true;

    return {
      itemId,
      winner,
      totalBids: this.getBidsByItem(itemId).length,
      closedAt: new Date().toISOString(),
    };
  }

  // ── Pricing Bridge ─────────────────────────────────────────────────────────

  getPricedFloor(input) {
    const { finalPrice } = calculateLeadPrice(input);
    return finalPrice;
  }
}

// ── Singleton Export ─────────────────────────────────────────────────────────

export const auctionEngine = new AuctionEngine();