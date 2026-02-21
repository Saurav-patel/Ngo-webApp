import crypto from "crypto";
import { Donation } from "../Models/donationModel.js";
import { Membership } from "../Models/membershipModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const donationWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      throw new ApiError(400, "Missing signature");
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new ApiError(400, "Invalid signature");
    }

    const event = JSON.parse(req.body.toString());
    const payment = event.payload?.payment?.entity;

    if (!payment?.order_id) {
      return res.status(200).json(new ApiResponse(200, { received: true }));
    }

    if (!["payment.captured", "payment.failed"].includes(event.event)) {
      return res.status(200).json(new ApiResponse(200, { received: true }));
    }

    /* -----------------------
       Atomic Idempotent Update
    ------------------------ */
    const updateData =
      event.event === "payment.captured"
        ? {
            status: "CAPTURED",
            razorpayPaymentId: payment.id,
            paidAt: new Date(),
            paymentSnapshot: {
              method: payment.method,
              bank: payment.bank,
              wallet: payment.wallet,
              vpa: payment.vpa
            }
          }
        : {
            status: "FAILED",
            failedReason:
              payment.error_description || "Payment failed"
          };

    const donation = await Donation.findOneAndUpdate(
      {
        razorpayOrderId: payment.order_id,
        status: { $ne: "CAPTURED" }
      },
      updateData,
      { new: true }
    );

    if (!donation) {
      // Already processed or not found
      return res.status(200).json({ received: true });
    }

    /* -----------------------
       Extra Amount Validation
    ------------------------ */
    if (
      event.event === "payment.captured" &&
      payment.amount !== donation.amount * 100
    ) {
      console.error("Amount mismatch detected in webhook");
      return res.status(200).json(new ApiResponse(200, { received: true }));
    }

    /* -----------------------
       Membership Activation
    ------------------------ */
    if (
      event.event === "payment.captured" &&
      donation.purpose === "MEMBERSHIP" &&
      donation.membershipId
    ) {
      const membership = await Membership.findById(
        donation.membershipId
      ).populate("plan");

      if (membership && membership.status !== "ACTIVE") {
        const startDate = new Date();

        const endDate = new Date(
          startDate.getTime() +
            membership.plan.durationInDays * 86400000
        );

        membership.status = "ACTIVE";
        membership.startDate = startDate;
        membership.endDate = endDate;

        await membership.save();
      }
    }

    return res.status(200).json(new ApiResponse(200, { received: true }));

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(200).json(new ApiResponse(200, { received: true }));
  }
};

export { donationWebhook };