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
  
  getDonationStatus,
  getDonationHistory,
  getAllDonations,
  donationStats,
  getSingleDonation
};
