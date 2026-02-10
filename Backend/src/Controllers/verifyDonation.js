import crypto from "crypto";
import Donation from "../Models/donationModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

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

export { verifyDonationPayment };
