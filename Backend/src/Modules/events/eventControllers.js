
import Event from "./eventModel.js"
import { uploadToCloudinary, cloudinary } from "../../utils/cloudConfig.js"
import { io } from "../../../index.js"
import mongoose from "mongoose"
import { ApiError } from "../../utils/apiError.js"
import { ApiResponse } from "../../utils/apiResponse.js"

const createEvent = async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, location } = req.body
    const files = req.files
  
    if (!title || !startDate || !endDate) {
      throw new ApiError(400, "Title, startDate and endDate are required")
    }

    if (new Date(endDate) < new Date(startDate)) {
      throw new ApiError(400, "End date must be after start date")
    }

    if (files && files.length > 8) {
      throw new ApiError(400, "Maximum 8 images allowed")
    }

    let photoUrls = []

    if (files && files.length > 0) {
      const uploadResults = await Promise.all(
        files.map(file =>
          uploadToCloudinary(file.buffer, "event", "events")
            .catch(() => ({ url: null, publicId: null }))
        )
      )

      photoUrls = uploadResults
        .filter(r => r.url)
        .map(r => ({
          url: r.url,
          publicId: r.publicId
        }))
    }

    const event = await Event.create({
      title,
      description,
      startDate,
      endDate,
      location,
      photos: photoUrls,
      createdBy: req.user?._id
    })

    io.emit("newEvent", event)

    return res
      .status(201)
      .json(new ApiResponse(201, event, "Event created successfully"))
  } catch (error) {
    next(error)
  }
}

const deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params
   
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID")
    }

    const event = await Event.findById(eventId)

    if (!event) {
      throw new ApiError(404, "Event not found")
    }

    if (event.photos && event.photos.length > 0) {
      await Promise.all(
        event.photos.map(photo =>
          photo.publicId
            ? cloudinary.uploader.destroy(photo.publicId).catch(() => {})
            : null
        )
      )
    }

    await Event.findByIdAndDelete(eventId)

    io.emit("delete-event", eventId)

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Event deleted successfully"))
  } catch (error) {
    next(error)
  }
}

const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .sort({ startDate: -1 })

    return res
      .status(200)
      .json(new ApiResponse(200, events, "Events fetched successfully"))
  } catch (error) {
    next(error)
  }
}

const getSingleEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID")
    }

    const event = await Event.findById(eventId)

    if (!event) {
      throw new ApiError(404, "Event not found")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, event, "Event fetched successfully"))
  } catch (error) {
    next(error)
  }
}

const updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params
    const { title, description, startDate, endDate, location } = req.body
    const files = req.files
    const user = req.user

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID")
    }

    const event = await Event.findById(eventId)

    if (!event) {
      throw new ApiError(404, "Event not found")
    }

    if (startDate) event.startDate = startDate
    if (endDate) event.endDate = endDate
    if (title) event.title = title
    if (description) event.description = description
    if (location) event.location = location

    if (files && files.length > 0) {
      const uploadResults = await Promise.all(
        files.map(file =>
          uploadToCloudinary(file.buffer, "event", "events")
            .catch(() => ({ url: null, publicId: null }))
        )
      )

      const newPhotos = uploadResults
        .filter(r => r.url)
        .map(r => ({
          url: r.url,
          publicId: r.publicId
        }))

      if (event.photos && event.photos.length > 0) {
        await Promise.all(
          event.photos.map(photo =>
            photo.publicId
              ? cloudinary.uploader.destroy(photo.publicId).catch(() => {})
              : null
          )
        )
      }

      event.photos = newPhotos
    }

    await event.save()

    io.emit("update-event", event)

    return res
      .status(200)
      .json(new ApiResponse(200, event, "Event updated successfully"))
  } catch (error) {
    next(error)
  }
}

export {
  createEvent,
  deleteEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent
}

