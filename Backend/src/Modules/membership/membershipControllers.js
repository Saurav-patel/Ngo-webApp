import { Membership } from "./membershipModel.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import { MembershipPlan } from "./membershipPlanModel.js";
import { razorpayInstance } from "../../utils/razorpay.js";
import { createPaymentOrder } from "../../utils/paymentService.js";

const createMembership = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const user = req.user;

    if (!planId) {
      throw new ApiError(400, "Plan ID is required");
    }

    const plan = await MembershipPlan.findById(planId);
    if (!plan || !plan.isActive) {
      throw new ApiError(404, "Invalid membership plan");
    }

    const existing = await Membership.findOne({
      user: user._id,
      status: { $in: ["PENDING", "ACTIVE"] }
    });

    if (existing) {
      throw new ApiError(400, "You already have active/pending membership");
    }

    const membership = await Membership.create({
      user: user._id,
      plan: plan._id,
      amountPaid: plan.price,
      status: "PENDING"
    });

    const { order } = await createPaymentOrder({
      userId: user._id,
      amount: plan.price,
      purpose: "MEMBERSHIP",
      membershipId: membership._id
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

const getMembershipPlans = async(req , res , next) => {
    try {
        const plans = await MembershipPlan.find({ isActive: true })
        if(plans.length === 0){
            throw new ApiError(404 , "No active membership plans found")
        }
        return res.status(200).json(new ApiResponse(200 , plans , "Membership plans retrieved successfully"))
    } catch (error) {
        next(error)
    }
}

const getUserMembership = async(req , res , next) => {
    try {
        const user = req.user
        const membership = await Membership.findOne({ user: user._id, status: { $in: ["PENDING", "ACTIVE"] } }).populate("plan")
        if(!membership){
            throw new ApiError(404 , "No active or pending membership found for this user")
        }
        return res.status(200).json(new ApiResponse(200 , membership , "User membership retrieved successfully"))
    } catch (error) {
        next(error)

    }
}

const getAllMembers = async (req ,res, next) => {
    try {
        const members = await Membership.find().populate("user").populate("plan")
        if(members.length === 0){
            return res.status(200).json(new ApiResponse(200 , [] , "No active members found"))
        }
        return res.status(200).json(new ApiResponse(200 , members , "All active members retrieved successfully"))
    } catch (error) {
        next(error)
    }
}

export {
    createMembership,
    getMembershipPlans,
    getUserMembership,
    getAllMembers
}