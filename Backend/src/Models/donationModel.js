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

    purpose: {
      type: String,
      enum: ["donation", "membership"],
      required: true,
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
      default: null
    },

    razorpaySignature: {
      type: String,
      default: null
    },

    receipt: {
      type: String
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
      index: true
    },

    paidAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);



const Donation = mongoose.model("Donation", donationSchema);
export default Donation;