
import validator from "validator";
import { ContactRequest } from "../Models/contactModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


const isValidEmail = (email) => {
  if (!email) return false
  try {
    return validator.isEmail(String(email))
  } catch (e) {
    // fallback regex (less robust)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))
  }
}


const stripHtmlTags = (input) => {
  if (typeof input !== "string") return ""
  return input.replace(/<[^>]*>/g, "").trim()
}

const createContactRequest = async (req, res, next) => {
  try {
    const { name, email, phone, reason, message } = req.body || {}

    if (!name || !email || !message) {
      throw new ApiError(400, "Name, email and message are required")
    }

    if (!isValidEmail(email)) {
      throw new ApiError(400, "Please provide a valid email address")
    }

    // Strip HTML from message and enforce minimum length after stripping
    const cleanMessage = stripHtmlTags(message)
    if (cleanMessage.length < 10) {
      throw new ApiError(400, "Message should be at least 10 characters long")
    }

    const contactDoc = await ContactRequest.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      reason: reason || "other",
      message: cleanMessage,
      user: req.user?._id || null
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          {
            id: contactDoc._id,
            message: "Your message has been received. We will contact you soon."
          }
        )
      );
  } catch (error) {
    next(error)
  }
};

const getContactRequests = async (req, res, next) => {
  try {
    const user = req.user
    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Only admins can view contact requests")
    }

    const page = parseInt(req.query.page, 10) || 1
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 10)
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ContactRequest.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email role")
        .select("-__v")
        .lean(),
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
      );
  } catch (error) {
    next(error)
  }
}

const updateContactRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user
    const { status } = req.body
    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Only admins can update contact request status")
    }
    const validStatuses = ["pending", "in_progress", "resolved", "closed"]
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status value")
    }
    const contactRequest = await ContactRequest.findById(id)
    if (!contactRequest) {
      throw new ApiError(404, "Contact request not found")
    }
    contactRequest.status = status
    await contactRequest.save()
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Contact request status updated")
      )


  } catch (error) {

    next(error)
  }

}

const deleteContactRequest = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user
    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Only admins can delete contact requests")
    }
    const contactRequest = await ContactRequest.findById(id)
    if (!contactRequest) {
      throw new ApiError(404, "Contact request not found")
    }
    await contactRequest.remove()
    return res
      .status(200)
      .json(
        new ApiResponse(200, "Contact request deleted successfully")
      )
  } catch (error) {
    next(error)
  }
}

const getContactRequestById = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user
    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Only admins can view contact requests")
    }
    const contactRequest = await ContactRequest.findById(id)
      .populate("user", "name email role")
      .select("-__v")
      .lean()
    if (!contactRequest) {
      throw new ApiError(404, "Contact request not found")
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, contactRequest)
      )
  }
  catch (error) {
    next(error)
  }
}

const getRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!id){
      throw new ApiError(400, "Contact request ID is required")
    }
    const contactRequest = await ContactRequest.findById(id).populate("status").lean()
    if (!contactRequest) {
      throw new ApiError(404, "Contact request not found")
    } 
    return res
      .status(200)
      .json(
        new ApiResponse(200, contactRequest , "Contact request status fetched successfully")
      )
  } catch (error) {
    next(error)
  }
}

export { createContactRequest, getContactRequests , updateContactRequestStatus, deleteContactRequest, getContactRequestById , getRequestStatus}
