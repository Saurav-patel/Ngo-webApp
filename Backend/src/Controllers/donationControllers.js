import crypto from "crypto";
import { razorpayInstance } from "../utils/razorpay.js";
import Donation from "../Models/donationModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const ALLOWED_AMOUNTS = [100, 250, 500, 1000, 5000];

const createDonationOrder = async (req, res, next) => {
  try {
    const { amount, name, email, phone , purpose } = req.body;

    if (!ALLOWED_AMOUNTS.includes(amount)) {
      throw new ApiError(400, "Invalid donation amount");
    }
    if (!["DONATION", "MEMBERSHIP"].includes(purpose)) {
    throw new ApiError(400, "Invalid purpose");
    }

    if (purpose === "MEMBERSHIP" && !req.user) {
    throw new ApiError(403, "Login required for membership");
  }
    if (!req.user && (!name || !email)) {
      throw new ApiError(400, "Name and email are required");
    }

    const receipt = `don_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const order = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt,
      notes: {
        purpose: purpose
      }
    });

    await Donation.create({
      userId: req.user?._id || null,
      donor: req.user ? null : { name, email, phone },
      purpose: purpose|| "DONATION",
      amount,
      currency: "INR",
      receipt,
      razorpayOrderId: order.id,
      status: "CREATED"
    });

    return res.status(200).json(
      new ApiResponse(200, {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      })
    );
  } catch (error) {
    next(error);
  }
};

const acknowledgeDonationPayment = async (req, res, next) => {
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
      throw new ApiError(400, "Invalid payload");
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new ApiError(400, "Signature mismatch");
    }

    // DO NOT update DB here
    return res.status(200).json(
      new ApiResponse(200, {
        message: "Payment received. Awaiting confirmation."
      })
    );
  } catch (error) {
    next(error);
  }
};

const donationWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) return res.status(400).send("Missing signature");

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());
    const payment = event.payload?.payment?.entity;
    if (!payment || !payment.order_id) {
      return res.status(200).json({ received: true });
    }

    const donation = await Donation.findOne({
      razorpayOrderId: payment.order_id
    });

    if (!donation) {
      return res.status(200).json({ received: true });
    }

    if (["CAPTURED", "REFUNDED"].includes(donation.status)) {
      return res.status(200).json({ received: true });
    }

    if (payment.amount !== donation.amount * 100) {
      return res.status(200).json({ received: true });
    }

    if (event.event === "payment.captured") {
      donation.status = "CAPTURED";
      donation.razorpayPaymentId = payment.id;
      donation.paidAt = new Date();
      donation.paymentSnapshot = {
        method: payment.method,
        bank: payment.bank,
        wallet: payment.wallet,
        vpa: payment.vpa
      };
    }

    if (event.event === "payment.failed") {
      donation.status = "FAILED";
      donation.failedReason =
        payment.error_description || "Payment failed";
    }

    await donation.save();
    return res.status(200).json({ received: true });
  } catch {
    return res.status(200).json({ received: true });
  }
};

const getDonationStatus = async (req, res, next) => {
  try {
    const donation = await Donation.findOne({
      razorpayOrderId: req.params.orderId
    }).select("status");

    if (!donation) {
      throw new ApiError(404, "Donation not found");
    }

    return res.status(200).json(
      new ApiResponse(200, {
        status: donation.status
      })
    );
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
      status: "CAPTURED"
    }).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, donations));
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

    return res.status(200).json(new ApiResponse(200, donations));
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
      { $match: { status: "CAPTURED" } },
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

    return res.status(200).json(new ApiResponse(200, result));
  } catch (error) {
    next(error);
  }
};

const getSingleDonation = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      throw new ApiError(403, "Forbidden");
    }

    const donation = await Donation.findById(req.params.donationId)
      .populate("userId", "name email");

    if (!donation) {
      throw new ApiError(404, "Donation not found");
    }

    return res.status(200).json(new ApiResponse(200, donation));
  } catch (error) {
    next(error);
  }
};

export {
  createDonationOrder,
  acknowledgeDonationPayment,
  donationWebhook,
  getDonationStatus,
  getDonationHistory,
  getAllDonations,
  donationStats,
  getSingleDonation
};
