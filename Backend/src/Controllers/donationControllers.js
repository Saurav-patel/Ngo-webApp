import { razorpayInstance } from "../utils/razorpay.js";
import Donation from "../Models/donationModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import crypto from "crypto";


const createDonationOrder = async (req, res, next) => {
  try {
    const { amount, name, email } = req.body;

    if (!amount || amount < 1) {
      throw new ApiError(400, "Invalid amount");
    }

    if (!req.user) {
      if (!name || !email) {
        throw new ApiError(
          400,
          "Donor name and email are required for guest donations"
        );
      }
    }

    if (amount > 100000) {
      throw new ApiError(400, "Donation amount too high");
    }

    const receipt = `donation_${Date.now()}`;

    const order = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt
    });

    await Donation.create({
      userId: req.user?._id || null,
      donor: req.user ? null : { name, email },
      purpose: "donation",
      amount,
      razorpayOrderId: order.id,
      receipt,
      status: "created"
    });

    return res
      .status(200)
      .json(new ApiResponse(200, order, "Order created successfully"));
  } catch (error) {
    next(error);
  }
};

const getDonationHistory = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      throw new ApiError(401, "Unauthorized");
    }

    const donations = await Donation.find({
      userId: req.user._id,
      status: "paid"
    }).sort({ createdAt: -1 });

    return res
      .status(200)
      .json(
        new ApiResponse(200, donations, "Donation history fetched successfully")
      );
  } catch (error) {
    next(error);
  }
};

const getAllDonations = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      throw new ApiError(403, "Forbidden");
    }

    const donations = await Donation.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    return res
      .status(200)
      .json(
        new ApiResponse(200, donations, "All donations fetched successfully")
      );
  } catch (error) {
    next(error);
  }
};

const verifyDonationPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      throw new ApiError(400, "Missing Razorpay payment details");
    }

    const donation = await Donation.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (!donation) {
      throw new ApiError(404, "Donation record not found");
    }

    if (donation.status === "paid") {
      return res.status(200).json(
        new ApiResponse(200, donation, "Payment already verified")
      );
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new ApiError(400, "Invalid payment signature");
    }

    donation.razorpayPaymentId = razorpay_payment_id;
    donation.razorpaySignature = razorpay_signature;
    donation.status = "paid";
    donation.paidAt = new Date();

    await donation.save();

    return res.status(200).json(
      new ApiResponse(200, donation, "Payment verified successfully")
    );

  } catch (error) {
    next(error);
  }
};

const donationStats = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      throw new ApiError(403, "Forbidden");
    }

    const stats = await Donation.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalDonations: { $sum: 1 }
        }
      }
    ]);

    const result = stats[0] || {
      totalAmount: 0,
      totalDonations: 0
    };

    return res.status(200).json(
      new ApiResponse(200, result, "Donation stats fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};
const getSingleDonation = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      throw new ApiError(403, "Forbidden");
    }

    const { donationId } = req.params;

    const donation = await Donation.findById(donationId)
      .populate("userId", "name email");

    if (!donation) {
      throw new ApiError(404, "Donation not found");
    }

    return res.status(200).json(
      new ApiResponse(200, donation, "Donation fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};

const donationWebhook = async (req, res) => {
  try {
    // 1️⃣ Get Razorpay signature from headers
    const razorpaySignature = req.headers["x-razorpay-signature"];
    if (!razorpaySignature) {
      return res.status(400).send("Missing Razorpay signature");
    }

    // 2️⃣ Verify signature using RAW body
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body) // ⚠️ RAW BUFFER
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).send("Invalid webhook signature");
    }

    // 3️⃣ Parse event AFTER signature verification
    const event = JSON.parse(req.body.toString());

    // 4️⃣ Handle only payment.captured
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      // 5️⃣ Find donation by order ID
      const donation = await Donation.findOne({
        razorpayOrderId
      });

      // If donation not found → ACK webhook, do not fail
      if (!donation) {
        console.warn(
          "Webhook received but donation not found:",
          razorpayOrderId
        );
        return res.status(200).json({ received: true });
      }

      // 6️⃣ Idempotency check
      if (donation.status !== "paid") {
        donation.status = "paid";
        donation.razorpayPaymentId = razorpayPaymentId;
        donation.paidAt = new Date();

        await donation.save();
      }
    }

    // 7️⃣ Always acknowledge webhook
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("Donation webhook error:", error);
    return res.status(500).send("Webhook error");
  }
};

export {
  createDonationOrder,
  getDonationHistory,
  getAllDonations,
  verifyDonationPayment,
  getSingleDonation,
  donationStats,
  donationWebhook
};