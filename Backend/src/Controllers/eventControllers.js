import Event from "../Models/eventModel.js"
import { uploadToCloudinary, cloudinary } from "../utils/cloudConfig.js"
import { io } from "../../index.js"
import mongoose from "mongoose"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const createEvent = async (req, res, next) => {
  try {
    const images = req.files
    const { title, description, date, location } = req.body
    const createdBy = req.user._id
    const user = req.user

    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Only admins can create events")
    }

    if (!title || !description || !location || !date) {
      throw new ApiError(400, "All fields are required")
    }

    if (images && images.length > 8) {
      throw new ApiError(400, "You can upload a maximum of 8 images")
    }

    let imageUrls = []
    if (images && images.length > 0) {
      const uploadResults = await Promise.all(
        images.map(img =>
          uploadToCloudinary(img.buffer, "event", "events")
            .catch(() => ({ url: null, publicId: null }))
        )
      )
      imageUrls = uploadResults
        .filter(r => r.url)
        .map(r => ({ url: r.url, publicId: r.publicId }))
    }

    const event = await Event.create({
      title,
      description,
      startDate: date,
      location,
      photos: imageUrls,
      createdBy
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
    const admin = req.user

    if (!admin || admin.role !== "admin") {
      throw new ApiError(403, "Forbidden: Only admins can delete events")
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID")
    }

    const event = await Event.findById(eventId)
    if (!event) {
      throw new ApiError(404, "Event not found")
    }

    if (event.images && event.images.length > 0) {
      for (const img of event.images) {
        if (img.publicId) {
          try {
            await cloudinary.uploader.destroy(img.publicId)
          } catch (err) {
            console.log("Failed to delete image:", img.publicId, err.message)
          }
        }
      }
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
    const events = await Event.find().sort({ date: -1 })

    if (!events || events.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No events found"))
    }

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
    const { title, description, date, location } = req.body
    const files = req.files
    const admin = req.user

    if (!admin || admin.role !== "admin") {
      throw new ApiError(403, "Forbidden: Only admins can update events")
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID")
    }

    const event = await Event.findById(eventId)
    if (!event) {
      throw new ApiError(404, "Event not found")
    }

    event.title = title || event.title
    event.description = description || event.description
    event.startDate = date || event.date
    event.location = location || event.location

    if (files && files.length > 0) {
      const uploadResults = await Promise.all(
        files.map(img =>
          uploadToCloudinary(img.buffer, "event", "events")
            .catch(() => ({ url: null, publicId: null }))
        )
      )

      const newImages = uploadResults
        .filter(r => r.url)
        .map(r => ({ url: r.url, publicId: r.publicId }))

      if (event.images && event.images.length > 0) {
        for (const img of event.images) {
          if (img.publicId) {
            try {
              await cloudinary.uploader.destroy(img.publicId)
            } catch (err) {
              console.log("Failed to delete image:", img.publicId, err.message)
            }
          }
        }
      }

      event.images = newImages
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

export { createEvent, deleteEvent, getAllEvents, getSingleEvent, updateEvent }
