import { ContactRequest } from "../Models/contactModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const createContactRequest = async (req, res, next) => {
  try {
    const { name, email, phone, reason, message } = req.body || {}

    if (!name || !email || !message) {
      throw new apiError(400, "Name, email and message are required")
    }

    if (!isValidEmail(email)) {
      throw new apiError(400, "Please provide a valid email address")
    }

    if (typeof message === "string" && message.trim().length < 10) {
      throw new apiError(
        400,
        "Message should be at least 10 characters long"
      )
    }

    const contactDoc = await ContactRequest.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      reason: reason || "other",
      message: message.trim(),
      user: req.user?._id || null
    })

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          
          "Your message has been received. We will contact you soon."
        )
      )
  } catch (error) {
    next(error)
  }
}


const getContactRequests = async (req, res, next) => {
  try {
    // You should already have role in req.user from auth middleware
    if (!req.user || req.user.role !== "admin") {
      throw new apiError(403, "Only admins can view contact requests")
    }

    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      ContactRequest.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email role"),
      ContactRequest.countDocuments()
    ])

    return res
      .status(200)
      .json(
        new ApiResponse(200, {
          items,
          total,
          page,
          totalPages: Math.ceil(total / limit)
        })
      )
  } catch (error) {
    next(error)
  }
}

export { createContactRequest, getContactRequests }