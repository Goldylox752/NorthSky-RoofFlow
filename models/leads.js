import mongoose from "mongoose";

/* ===============================
   LEAD SCHEMA (MARKETPLACE CORE)
=============================== */

const LeadSchema = new mongoose.Schema(
  {
    /* ===============================
       CORE IDENTITY
    =============================== */
    name: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },

    city: { type: String, trim: true, index: true },
    category: { type: String, trim: true, index: true }, // IMPORTANT for marketplace

    /* ===============================
       LIFECYCLE STATE MACHINE
    =============================== */
    status: {
      type: String,
      enum: [
        "new",
        "available",
        "locked",
        "sold",
        "assigned",
        "completed",
        "failed",
        "rejected",
      ],
      default: "new",
      index: true,
    },

    /* ===============================
       MARKET VALUE ENGINE
    =============================== */
    score: {
      type: Number,
      default: 5,
      min: 1,
      max: 100,
      index: true,
    },

    price: {
      type: Number,
      default: 0,
      index: true,
    },

    currency: {
      type: String,
      default: "usd",
    },

    /* ===============================
       STRIPE LINKAGE (CRITICAL UPGRADE)
    =============================== */
    stripe_payment_intent: {
      type: String,
      default: null,
      index: true,
    },

    paid: {
      type: Boolean,
      default: false,
      index: true,
    },

    billed_at: {
      type: Date,
      default: null,
    },

    /* ===============================
       MARKETPLACE OWNERSHIP (MULTI-TENANT)
    =============================== */
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    assigned_contractor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    /* ===============================
       LOCK SYSTEM (ANTI RACE CONDITIONS)
    =============================== */
    lock: {
      owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true,
      },

      locked_at: Date,

      expires_at: {
        type: Date,
        index: true,
      },
    },

    /* ===============================
       DEDUPLICATION (CRITICAL FOR SCRAPING)
    =============================== */
    dedupeKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    source: {
      type: String,
      default: "direct",
      index: true,
    },

    /* ===============================
       CONVERSION TRACKING (SAAS METRICS)
    =============================== */
    funnel: {
      viewed: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
      locked: { type: Number, default: 0 },
      purchased: { type: Number, default: 0 },
    },

    /* ===============================
       EVENT LOG (AUDIT TRAIL)
    =============================== */
    events: [
      {
        type: {
          type: String,
          enum: [
            "created",
            "viewed",
            "locked",
            "unlocked",
            "purchased",
            "assigned",
            "completed",
            "rejected",
          ],
        },

        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        price: Number,
        city: String,
        source: String,

        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },

  {
    timestamps: true,
  }
);

/* ===============================
   INDEXES (OPTIMIZED FOR MARKETPLACE QUERIES)
=============================== */
LeadSchema.index({ city: 1, status: 1, score: -1 });
LeadSchema.index({ category: 1, status: 1, price: 1 });
LeadSchema.index({ "lock.expires_at": 1 });
LeadSchema.index({ buyer_id: 1, createdAt: -1 });
LeadSchema.index({ assigned_contractor_id: 1 });

/* ===============================
   EXPORT SAFE MODEL
=============================== */
export default mongoose.models.Lead ||
  mongoose.model("Lead", LeadSchema);