import mongoose from "mongoose"
import { Participation } from "../Models/participationModel.js"
import Event from "../Models/eventModel.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const registerParticipant = async (req, res, next) => {
  try {
    const { eventId } = req.params
    const userId = req.user?._id

    if (!userId) {
      throw new ApiError(401, "Unauthorized: User not logged in")
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID")
    }

    const eventExists = await Event.exists({ _id: eventId })
    if (!eventExists) {
      throw new ApiError(404, "Event not found")
    }

    const alreadyRegistered = await Participation.findOne({ userId, eventId })
    if (alreadyRegistered) {
      throw new ApiError(400, "User is already registered for this event")
    }

    const participation = await Participation.create({ userId, eventId, status: "registered" })

    return res.status(201).json(new ApiResponse(201, participation, "Participant registered successfully"))
  } catch (error) {
    next(error)
  }
}

const allParticipants = async (req, res, next) => {
  try {
    const { eventId } = req.params

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID")
    }

    const eventExists = await Event.exists({ _id: eventId })
    if (!eventExists) {
      throw new ApiError(404, "Event not found")
    }

    const participants = await Participation.find({ eventId })
      .populate("userId", "username email phone")
      .select("userId status createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    if (!participants.length) {
      return res.status(200).json(new ApiResponse(200, [], "No participants found for this event"))
    }

    return res.status(200).json(new ApiResponse(200, participants, "Participants fetched successfully"))
  } catch (error) {
    next(error)
  }
}

const userParticipation = async (req, res, next) => {
  try {
    const { userId } = req.params
    const user = req.user

    if (user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    if (!userId) {
      throw new ApiError(400, "Please provide user ID")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID")
    }

    const participations = await Participation.find({ userId })
      .populate("eventId", "title date location startDate endDate")
      .populate("certificateId", "certificateType issuedAt")
      .select("-__v")
      .sort({ createdAt: -1 })

    if (!participations.length) {
      return res.status(200).json(new ApiResponse(200, [], "No events found for this user"))
    }

    return res.status(200).json(new ApiResponse(200, participations, "Events fetched successfully"))
  } catch (error) {
    next(error)
  }
}

const myParticipation = async (req, res, next) => {
  try {
    const userId = req.user?._id
    if (!userId) {
      throw new ApiError(401, "Unauthorized: User not logged in")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID")
    }

    const participations = await Participation.find({ userId })
      .populate("eventId", "title date location startDate endDate")
      .populate("certificateId", "certificateType issuedAt")
      .select("-__v")
      .sort({ createdAt: -1 })

    if (!participations.length) {
      throw new ApiResponse(200, "No events found for this user")
    }

    return res.status(200).json(new ApiResponse(200, participations, "Events fetched successfully"))
  } catch (error) {
    next(error)
  }
}

const updateStatus = async (req, res, next) => {
  try {
    const { participationId } = req.params
    const { status } = req.body
    const user = req.user

    if (user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    const allowedStatuses = ["registered", "attended", "cancelled"]

    if (!participationId || !status) {
      throw new ApiError(400, "Please provide participation ID and status")
    }

    if (!allowedStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Allowed: ${allowedStatuses.join(", ")}`)
    }

    if (!mongoose.Types.ObjectId.isValid(participationId)) {
      throw new ApiError(400, "Invalid participation ID")
    }

    const participation = await Participation.findById(participationId)
    if (!participation) {
      throw new ApiError(404, "Participation not found")
    }

    participation.status = status
    await participation.save()

    return res.status(200).json(new ApiResponse(200, participation, "Participation status updated successfully"))
  } catch (error) {
    next(error)
  }
}

export { registerParticipant, allParticipants, userParticipation, updateStatus, myParticipation }
