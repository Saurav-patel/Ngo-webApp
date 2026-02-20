import { Membership } from "../Models/membershipModel.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { MembershipPlan } from "../Models/membershipPlanModel.js";
import { razorpayInstance } from "../utils/razorpay.js";


const createMembership = async (req , res , next) => {
   try {
    const { planId } = req.body
    const user = req.user
    if(!planId){
        throw new ApiError(400 , "Membership plan ID is required")
    }
    const plan = await MembershipPlan.findById(planId)
    if(!plan){
        throw new ApiError(404 , "Membership plan not found")
    }
    const existingMembership = await Membership.findOne({ user: user._id, status: { $in: ["PENDING", "ACTIVE"] } })
    if(existingMembership){
        throw new ApiError(400 , "You already have an active or pending membership")
    }
    const order = await razorpayInstance.orders.create({
        amount: plan.price * 100,
        currency: "INR",
        receipt: `membership_${user._id}_${Date.now()}`,
    })
    const membership = await Membership.create({
        user: user._id,
        plan: plan._id,
        razorpayOrderId: order.id,
        razorpayPaymentId: order.payment_id,
        amountPaid: plan.price,
        status: "PENDING"
    })
    return res.status(200).json(new ApiResponse(200 , {
        membershipId: membership._id,
        orderId: order.id,
        amount: order.amount,
       
    }, "Membership order created successfully"))

   } catch (error) {
    next(error)
   }
}
