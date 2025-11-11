import Visitor from "../Models/visitorModel.js"
import Event from "../Models/eventModel.js"
import mongoose from "mongoose"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const addVisitor = async (req, res, next) => {
  try {
    const { name, email, phone, address, eventId } = req.body

    if (!name || !email || !eventId) {
      throw new ApiError(400, "Name, email, and event participation (eventId) are required")
    }

    const event = await Event.findById(eventId)
    if (!event) {
      throw new ApiError(404, "Event not found. Visitor can only be created if they participate in a valid event")
    }

    const existingVisitor = await Visitor.findOne({ email: email.toLowerCase() })
    if (existingVisitor) {
      throw new ApiError(400, "Visitor with this email already exists")
    }

    const visitor = await Visitor.create({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      events: [eventId],
    })

    return res.status(201).json(new ApiResponse(201, visitor, "Visitor added successfully"))
  } catch (error) {
    next(error)
  }
}

const allVisitor = async (req, res, next) => {
  try {
    const countVisitors = await Visitor.countDocuments()
    if (countVisitors <= 0) {
      throw new ApiError(404, "No visitors found")
    }

    const visitors = await Visitor.find()

    return res.status(200).json(
      new ApiResponse(200, { countVisitors, visitors }, "Visitors fetched successfully")
    )
  } catch (error) {
    next(error)
  }
}

const deleteVisitor = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) {
      throw new ApiError(400, "Please provide email to delete a user")
    }

    const visitor = await Visitor.findOne({ email })
    if (!visitor) {
      throw new ApiError(404, "Visitor not found")
    }

    await Visitor.deleteOne({ email })
    return res.status(200).json(new ApiResponse(200, null, "Visitor deleted successfully"))
  } catch (error) {
    next(error)
  }
}

const getVisitorInfo = async (req, res, next) => {
  try {
    const { visitorId } = req.params

    if (!visitorId) {
      throw new ApiError(400, "Please provide visitor ID")
    }

    if (!mongoose.Types.ObjectId.isValid(visitorId)) {
      throw new ApiError(400, "Invalid visitor ID")
    }

    const visitorInfo = await Visitor.findById(visitorId)
      .populate("donations", "amount date method")
      .populate("events", "title date location")
      .populate("certificates", "type issueDate")
      .select("-createdBy -updatedAt -__v")

    if (!visitorInfo) {
      throw new ApiError(404, "Visitor not found")
    }

    return res.status(200).json(new ApiResponse(200, visitorInfo, "Visitor info fetched successfully"))
  } catch (error) {
    next(error)
  }
}

export { addVisitor, allVisitor, deleteVisitor, getVisitorInfo }
