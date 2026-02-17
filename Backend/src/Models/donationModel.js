import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    refundId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String },
    refundedAt: { type: Date }
  },
  { _id: false }
);

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
        "REFUNDED"
      ],
      default: "CREATED",
      index: true
    },

    paidAt: Date,

    failedReason: String,

    refunds: [refundSchema]
  },
  { timestamps: true }
);

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
