import { razorpayInstance } from "../utils/razorpay.js";
import Donation from "../Models/donationModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const createDonationOrder = async (req, res, next) => {
  try {
    const { amount, name, email } = req.body;

    if (!amount || amount < 1) {
      throw new ApiError(400, "Invalid amount");
    }
    
    if(!req.user){
        if (!name || !email ) {
            throw new ApiError(400, "Donor name, email, and phone are required for guest donations");
        }
    }
    if (amount > 100000) {
      throw new ApiError(400, "Donation amount too high");
    }

    const receipt = `donation_${Date.now()}`;

    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt
    });
    
    await Donation.create({
      userId: req.user?._id || null,
      donor: req.user
        ? null
        : {
            name,
            email,
            phone
          },
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

export { createDonationOrder };
