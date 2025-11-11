import mongoose from "mongoose"
import AppointmentLetter from "../Models/appointmentLetterModel.js"
import Visitor from "../Models/visitorModel.js"
import Document from "../Models/documentModel.js"
import { uploadToCloudinary } from "../utils/cloudConfig.js"
import generateAppointmentLetter from "../utils/letterConfig.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const applyAppointmentLetter = async (req, res, next) => {
  try {
    const userId = req.user?._id
    const userName = req.user?.name || "User"

    if (!userId) {
      throw new ApiError(401, "Unauthorized: Please log in to apply for appointment letter")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID format")
    }

    const existingLetter = await AppointmentLetter.findOne({
      issuedTo: userId,
      generated: false
    })

    if (existingLetter) {
      throw new ApiError(400, "You already have a pending appointment letter request")
    }

    const letterContent = `This is a placeholder for ${userName}'s appointment letter. 
The final letter content will be updated once approved by the admin.`

    const newLetter = await AppointmentLetter.create({
      issuedTo: userId,
      createdBy: userId,
      generated: false,
      content: letterContent
    })

    return res
      .status(201)
      .json(new ApiResponse(201, newLetter, "Appointment letter application submitted successfully"))
  } catch (error) {
    next(error)
  }
}

const generateLetter = async (req, res, next) => {
  try {
    const userId = req.user?._id
    const userName = req.user?.name || "User"

    if (!userId) {
      throw new ApiError(401, "Unauthorized: Please log in")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID format")
    }

    const letter = await AppointmentLetter.findOne({
      issuedTo: userId,
      generated: false
    })
    if (!letter) {
      throw new ApiError(404, "No pending appointment letter request found")
    }

    const logoDoc = await Document.findOne({ title: /logo/i })
    const signDoc = await Document.findOne({ title: /sign/i })

    const logoUrl = logoDoc?.fileUrl?.[0]?.url || "https://via.placeholder.com/100"
    const signUrl = signDoc?.fileUrl?.[0]?.url || "https://via.placeholder.com/100"

    const imageBuffer = await generateAppointmentLetter({
      logoUrl,
      signUrl,
      recipientName: userName,
      ngoName: "Your NGO Name"
    })

    const uploadResponse = await uploadToCloudinary(imageBuffer, `appointment_letter_${userId}`, "appointment_letters")

    letter.generated = true
    letter.fileUrl = uploadResponse.secure_url
    letter.filePublicId = uploadResponse.public_id
    await letter.save()

    const responseData = {
      id: letter._id,
      issuedTo: userName,
      fileUrl: uploadResponse.secure_url
    }

    return res
      .status(200)
      .json(new ApiResponse(200, responseData, "Appointment letter generated successfully"))
  } catch (error) {
    next(error)
  }
}

const getPendingAndGeneratedAppointmentLetter = async (req, res, next) => {
  try {
    const admin = req.user
    if (!admin || admin.role !== "admin") {
      throw new ApiError(403, "Forbidden: Only admins can view appointment letters")
    }

    const letters = await AppointmentLetter.find()
      .populate("issuedTo", "username email")
      .sort({ createdAt: -1 })

    if (!letters || letters.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, { pendingLetters: [], generatedLetters: [] }, "No appointment letters found"))
    }

    const pendingLetters = letters.filter(l => !l.generated)
    const generatedLetters = letters.filter(l => l.generated)

    return res
      .status(200)
      .json(new ApiResponse(200, { pendingLetters, generatedLetters }, "Appointment letters fetched successfully"))
  } catch (error) {
    next(error)
  }
}

const visitorLetter = async (req, res, next) => {
  try {
    const { email, phone, name, address } = req.body

    if (!email) {
      throw new ApiError(400, "Please provide email to apply for appointment letter")
    }

    let visitor = await Visitor.findOne({ email })

    if (!visitor) {
      visitor = await Visitor.create({
        name,
        email: email.toLowerCase(),
        phone,
        address
      })
    }

    await AppointmentLetter.create({
      issuedTo: visitor._id,
      createdBy: visitor._id,
      generated: false,
      content: "This is your appointment letter. The final content will be updated soon."
    })

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Appointment letter application submitted successfully"))
  } catch (error) {
    next(error)
  }
}

const myLetters = async (req, res, next) => {
  try {
    const { userId } = req.params

    if (!userId) {
      throw new ApiError(400, "Please provide user ID to fetch appointment letters")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID")
    }

    const letters = await AppointmentLetter.find({ issuedTo: userId }).sort({ createdAt: -1 })

    if (!letters || letters.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No appointment letters found"))
    }

    return res
      .status(200)
      .json(new ApiResponse(200, letters, "Appointment letters fetched successfully"))
  } catch (error) {
    next(error)
  }
}

export {
  getPendingAndGeneratedAppointmentLetter,
  applyAppointmentLetter,
  generateLetter,
  visitorLetter,
  myLetters
}
