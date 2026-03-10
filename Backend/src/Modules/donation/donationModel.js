import mongoose from "mongoose";



const donationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    donor: {
      name: { type: String, trim: true },
      email: { type: String, lowercase: true, trim: true },
      phone: { type: String, trim: true }
    },
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Membership",
      default: null,
      index: true
    },
    purpose: {
      type: String,
      enum: ["DONATION", "MEMBERSHIP"],
      required: true,
      index: true
    },

    receipt: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    currency: {
      type: String,
      default: "INR"
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

    paymentSnapshot: {
      method: String,
      bank: String,
      wallet: String,
      vpa: String
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "CAPTURED",
        "FAILED",
        
      ],
      default: "CREATED",
      index: true
    },

    paidAt: Date,

    failedReason: String,

    
  },
  { timestamps: true }
);

export const Donation = mongoose.model("Donation", donationSchema);

