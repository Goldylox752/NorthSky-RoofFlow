export const auctionEngine = {
  bids: [],

  placeBid({ userId, itemId, amount }) {
    if (!userId || !itemId || !amount) {
      throw new Error("Missing bid data");
    }

    const bid = {
      id: `${Date.now()}-${Math.random()}`,
      userId,
      itemId,
      amount,
      timestamp: new Date().toISOString(),
    };

    this.bids.push(bid);

    return {
      success: true,
      bid,
    };
  },

  getBidsByItem(itemId) {
    return this.bids.filter((b) => b.itemId === itemId);
  },

  getHighestBid(itemId) {
    const bids = this.getBidsByItem(itemId);
    if (bids.length === 0) return null;

    return bids.reduce((max, bid) =>
      bid.amount > max.amount ? bid : max
    );
  },
};