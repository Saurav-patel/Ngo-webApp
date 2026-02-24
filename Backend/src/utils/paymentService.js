// services/paymentService.js

import {Donation} from "../Models/donationModel.js";
import { razorpayInstance } from "./razorpay.js";

export const createPaymentOrder = async ({
  userId = null,
  donor = null,
  amount,
  purpose,
  membershipId = null
}) => {

  const receipt = `rcpt_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const order = await razorpayInstance.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt,
    notes: {
      purpose,
      membershipId: membershipId?.toString() || ""
    }
  });

  const payment = await Donation.create({
    userId,
    donor,
    membershipId,
    purpose,
    amount,
    currency: "INR",
    receipt,
    razorpayOrderId: order.id,
    status: "CREATED"
  });

  return {
    order,
    payment
  };
};