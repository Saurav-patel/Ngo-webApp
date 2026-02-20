import mongoose from "mongoose";

const membershipPlanSchema = new mongoose.Schema({

  name: {
    type: String,
    enum: ["SILVER", "GOLD", "PLATINUM"],
    required: true,
    unique: true,
    trim: true
  },

  durationInMonths: {
    type: Number,
    required: true,
    min: 1
  },

  price: {
    type: Number,
    required: true,
    min: 1
  },

  benefits: {
    type: [String],
    default: []
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  }

}, { timestamps: true });

export const MembershipPlan = mongoose.model("MembershipPlan", membershipPlanSchema);