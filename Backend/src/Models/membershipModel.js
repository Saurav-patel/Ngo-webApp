import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MembershipPlan",
    required: true
  },

  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  razorpayPaymentId: {
    type: String,
    unique: true,
    sparse: true
  },

  razorpaySignature: {
    type: String
  },

  amountPaid: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["PENDING", "ACTIVE", "EXPIRED", "FAILED", "CANCELLED"],
    default: "PENDING"
  },

  startDate: Date,
  endDate: Date

}, { timestamps: true });

export const Membership = mongoose.model("Membership", membershipSchema);