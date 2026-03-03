import crypto from "crypto";
import { Donation } from "../Modules/donation/donationModel.js";
import { Membership } from "../Modules/membership/membershipModel.js";
import { ApiResponse } from "../utils/apiResponse.js";

const donationWebhook = async (req, res) => {
  try {
    /* -------------------------
       1️⃣ Signature Verification
    -------------------------- */

    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).json({ message: "Missing signature" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body) // raw buffer
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Invalid webhook signature");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(req.body.toString());
    const paymentEntity = event.payload?.payment?.entity;

    if (!paymentEntity?.order_id) {
      return res.status(200).json(new ApiResponse(200, { received: true }));
    }

    if (!["payment.captured", "payment.failed"].includes(event.event)) {
      return res.status(200).json(new ApiResponse(200, { received: true }));
    }

    /* -------------------------
       2️⃣ Atomic Idempotent Update
    -------------------------- */

    const updateData =
      event.event === "payment.captured"
        ? {
            status: "CAPTURED",
            razorpayPaymentId: paymentEntity.id,
            paidAt: new Date(),
            paymentSnapshot: {
              method: paymentEntity.method,
              bank: paymentEntity.bank,
              wallet: paymentEntity.wallet,
              vpa: paymentEntity.vpa
            }
          }
        : {
            status: "FAILED",
            failedReason:
              paymentEntity.error_description || "Payment failed"
          };

    const donation = await Donation.findOneAndUpdate(
      {
        razorpayOrderId: paymentEntity.order_id,
        status: { $ne: "CAPTURED" } // idempotency guard
      },
      updateData,
      { new: true }
    );

    if (!donation) {
      // Already processed or not found
      return res.status(200).json(new ApiResponse(200, { received: true }));
    }

    /* -------------------------
       3️⃣ Extra Amount Validation
    -------------------------- */

    if (
      event.event === "payment.captured" &&
      paymentEntity.amount !== donation.amount * 100
    ) {
      console.error(
        `Amount mismatch for order ${paymentEntity.order_id}. 
         Expected: ${donation.amount * 100}, 
         Received: ${paymentEntity.amount}`
      );
      return res.status(200).json(new ApiResponse(200, { received: true }));
    }

    /* -------------------------
       4️⃣ Membership Handling
    -------------------------- */

    if (donation.purpose === "MEMBERSHIP" && donation.membershipId) {
      const membership = await Membership.findById(
        donation.membershipId
      ).populate("plan");

      if (membership) {
        if (event.event === "payment.captured") {
          if (membership.status !== "ACTIVE") {
            const startDate = new Date();

            const endDate = new Date(
              startDate.getTime() +
                membership.plan.duration * 86400000
            );

            membership.status = "ACTIVE";
            membership.startDate = startDate;
            membership.endDate = endDate;

            await membership.save();
          }
        }

        if (event.event === "payment.failed") {
          membership.status = "FAILED";
          await membership.save();
        }
      }
    }

    return res.status(200).json(new ApiResponse(200, { received: true }));

  } catch (error) {
    console.error("Webhook processing error:", error);

    // Return 500 so Razorpay retries in real failure cases
    return res.status(500).json({ message: "Webhook error" });
  }
};

export { donationWebhook };