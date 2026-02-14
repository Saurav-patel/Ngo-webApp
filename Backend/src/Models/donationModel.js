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
      enum: ["DONATION", "MEMBERSHIP"],
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
      unique: true,
      sparse: true // allows multiple nulls
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "AUTHORIZED",
        "CAPTURED",
        "FAILED",
        "REFUNDED"
      ],
      default: "CREATED",
      index: true
    },

    paidAt: Date,

    failedReason: {
      type: String
    },

    refundId: {
      type: String
    }

  },
  { timestamps: true }
);



const Donation = mongoose.model("Donation", donationSchema);
export default Donation;