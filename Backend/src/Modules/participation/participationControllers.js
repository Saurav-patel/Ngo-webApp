
import mongoose from "mongoose"
import {Participation} from "./participationModel.js"
import Event from "../events/eventModel.js"
import { ApiError } from "../../utils/apiError.js"
import { ApiResponse } from "../../utils/apiResponse.js"

const registerParticipant = async (req, res, next) => {
  try {
    const { eventId } = req.params
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID")
    }

    const event = await Event.findById(eventId)

    if (!event) {
      throw new ApiError(404, "Event not found")
    }

    const participation = await Participation.create({
      userId: req.user?._id,
      eventId,
      status: "REGISTERED"
    })

    return res
      .status(201)
      .json(new ApiResponse(201, participation, "Registered successfully"))

  } catch (error) {

    if (error.code === 11000) {
      return next(new ApiError(400, "Already registered for this event"))
    }

    next(error)
  }
}

const allParticipants = async (req, res, next) => {
  try {
    const { eventId } = req.params

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID")
    }

    const participants = await Participation.find({ eventId })
      .populate("userId", "username email phone")
      .select("userId status createdAt")
      .sort({ createdAt: -1 })
      .lean()

    return res
      .status(200)
      .json(new ApiResponse(200, participants, "Participants fetched"))

  } catch (error) {
    next(error)
  }
}

const userParticipation = async (req, res, next) => {
  try {
    const { userId } = req.params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID")
    }

    const participations = await Participation.find({ userId })
      .populate("eventId", "title location startDate endDate status")
      .populate("certificateId", "type issueDate certificateCode")
      .sort({ createdAt: -1 })

    return res
      .status(200)
      .json(new ApiResponse(200, participations, "User events fetched"))

  } catch (error) {
    next(error)
  }
}

const myParticipation = async (req, res, next) => {
  try {
    const userId = req.user?._id

    const participations = await Participation.find({ userId })
      .populate("eventId", "title location startDate endDate status")
      .populate("certificateId", "type issueDate certificateCode")
      .sort({ createdAt: -1 })

    return res
      .status(200)
      .json(new ApiResponse(200, participations, "My events fetched"))

  } catch (error) {
    next(error)
  }
}

const updateStatus = async (req, res, next) => {
  try {
    const { participationId } = req.params
    const { status } = req.body

    const allowedStatuses = ["REGISTERED", "ATTENDED", "ABSENT"]

    if (!allowedStatuses.includes(status)) {
      throw new ApiError(
        400,
        `Invalid status. Allowed: ${allowedStatuses.join(", ")}`
      )
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

    return res
      .status(200)
      .json(new ApiResponse(200, participation, "Status updated"))

  } catch (error) {
    next(error)
  }
}

export {
  registerParticipant,
  allParticipants,
  userParticipation,
  myParticipation,
  updateStatus
}

