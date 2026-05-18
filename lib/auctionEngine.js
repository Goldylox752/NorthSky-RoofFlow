// /server/engines/auction.engine.ts

import { calculateLeadPrice } from "./pricing.engine";

// ── Types ─────────────────────────────────────────────────────────────────────

type BidStatus = "ACTIVE" | "RETRACTED" | "WON" | "OUTBID";

type Bid = {
  id: string;
  userId: string;
  itemId: string;
  amount: number;
  status: BidStatus;
  timestamp: string;
};

type AuctionItem = {
  id: string;
  minBid: number;
  maxBid?: number;
  reservePrice?: number;
  endsAt?: string;        // ISO — if set, bids after this are rejected
  winnerId?: string;
  closed: boolean;
};

type PlaceBidInput = {
  userId: string;
  itemId: string;
  amount: number;
};

type PlaceBidResult =
  | { success: true;  bid: Bid; newHighest: boolean; leadingAmount: number }
  | { success: false; reason: string };

type CloseAuctionResult = {
  itemId: string;
  winner: Bid | null;
  totalBids: number;
  closedAt: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const BID_INCREMENT = 50;           // min raise over current highest
const MAX_BIDS_PER_USER = 20;       // abuse guard per item

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateBidId(): string {
  return `BID-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function isExpired(item: AuctionItem): boolean {
  if (!item.endsAt) return false;
  return new Date() > new Date(item.endsAt);
}

// ── Engine ────────────────────────────────────────────────────────────────────

class AuctionEngine {
  private bids: Map<string, Bid[]> = new Map();   // itemId → Bid[]
  private items: Map<string, AuctionItem> = new Map();

  // ── Item Management ─────────────────────────────────────────────────────────

  registerItem(item: AuctionItem): AuctionItem {
    if (this.items.has(item.id)) {
      throw new Error(`Item ${item.id} already registered`);
    }
    this.items.set(item.id, { ...item, closed: false });
    this.bids.set(item.id, []);
    console.log(`[auction] item registered | id=${item.id} minBid=${item.minBid}`);
    return item;
  }

  getItem(itemId: string): AuctionItem | null {
    return this.items.get(itemId) ?? null;
  }

  // ── Bid Placement ───────────────────────────────────────────────────────────

  placeBid({ userId, itemId, amount }: PlaceBidInput): PlaceBidResult {
    // Validate input
    if (!userId || !itemId || !amount) {
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
      return { success: false, reason: `Minimum bid is $${item.minBid}` };
    }

    if (item.maxBid && amount > item.maxBid) {
      return { success: false, reason: `Maximum bid is $${item.maxBid}` };
    }

    // Enforce minimum increment over current highest
    const highest = this.getHighestBid(itemId);
    if (highest && amount < highest.amount + BID_INCREMENT) {
      return {
        success: false,
        reason: `Bid must be at least $${highest.amount + BID_INCREMENT} (current: $${highest.amount})`,
      };
    }

    // Abuse guard
    const userBids = (this.bids.get(itemId) ?? []).filter(
      (b) => b.userId === userId && b.status === "ACTIVE"
    );
    if (userBids.length >= MAX_BIDS_PER_USER) {
      return { success: false, reason: "Bid limit reached for this item" };
    }

    // Mark previous highest as OUTBID
    if (highest) {
      highest.status = "OUTBID";
    }

    // Place bid
    const bid: Bid = {
      id: generateBidId(),
      userId,
      itemId,
      amount,
      status: "ACTIVE",
      timestamp: new Date().toISOString(),
    };

    this.bids.get(itemId)!.push(bid);

    const newHighest = !highest || amount > highest.amount;

    console.log(
      `[auction] bid placed | id=${bid.id} user=${userId} item=${itemId} amount=${amount} leading=${newHighest}`
    );

    return {
      success: true,
      bid,
      newHighest,
      leadingAmount: amount,
    };
  }

  // ── Queries ─────────────────────────────────────────────────────────────────

  getBidsByItem(itemId: string): Bid[] {
    return this.bids.get(itemId) ?? [];
  }

  getActiveBids(itemId: string): Bid[] {
    return this.getBidsByItem(itemId).filter((b) => b.status === "ACTIVE");
  }

  getHighestBid(itemId: string): Bid | null {
    const active = this.getActiveBids(itemId);
    if (!active.length) return null;
    return active.reduce((max, bid) => (bid.amount > max.amount ? bid : max));
  }

  getBidHistory(itemId: string): Bid[] {
    return [...this.getBidsByItem(itemId)].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // ── Close Auction ───────────────────────────────────────────────────────────

  closeAuction(itemId: string): CloseAuctionResult {
    const item = this.items.get(itemId);
    if (!item) throw new Error(`Item ${itemId} not found`);
    if (item.closed) throw new Error(`Auction ${itemId} already closed`);

    const winner = this.getHighestBid(itemId);

    // Reserve price check
    if (winner && item.reservePrice && winner.amount < item.reservePrice) {
      console.warn(
        `[auction] reserve not met | item=${itemId} highest=${winner.amount} reserve=${item.reservePrice}`
      );
    }

    if (winner) {
      winner.status = "WON";
      item.winnerId = winner.userId;
    }

    item.closed = true;

    const result: CloseAuctionResult = {
      itemId,
      winner,
      totalBids: this.getBidsByItem(itemId).length,
      closedAt: new Date().toISOString(),
    };

    console.log(
      `[auction] closed | item=${itemId} winner=${winner?.userId ?? "none"} amount=${winner?.amount ?? 0} totalBids=${result.totalBids}`
    );

    return result;
  }

  // ── Pricing Bridge ──────────────────────────────────────────────────────────

  getPricedFloor(pricingInput: Parameters<typeof calculateLeadPrice>[0]): number {
    const { finalPrice } = calculateLeadPrice(pricingInput);
    return finalPrice;
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

export const auctionEngine = new AuctionEngine();
