import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    phone: { type: String },
    name: { type: String },

    status: {
      type: String,
      enum: ["new", "qualified", "booked", "rejected"],
      default: "new",
    },

    score: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true, // replaces manual createdAt
  }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);