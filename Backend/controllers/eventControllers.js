import Event from "../Models/eventModel.js";
import { uploadToCloudinary } from "../utils/cloudConfig.js";
import { io } from "../index.js";
import mongoose from "mongoose";

const createEvent = async (req, res) => {
  try {
    const images = req.files
    const { title, description, date, location } = req.body
    const createdBy = req.user._id

    if (!title || !description || !location || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }

    let imageUrls = []

    if (images.length > 8) {
      return res.status(400).json({
        success: false,
        message: "You can upload a maximum of 8 images"
      })
    }

    if (images && images.length > 0) {
      const uploadResults = await Promise.all(
        images.map(img =>
          uploadToCloudinary(img.buffer, "event", "events")
            .catch(err => ({ url: null, publicId: null })) 
        )
      )
      imageUrls = uploadResults
        .filter(r => r.url) 
        .map(r => ({ url: r.url, publicId: r.publicId }))
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      images: imageUrls,
      createdBy
    })

    io.emit("newEvent", event)

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message
    })
  }
}

const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID"
      })
    }

    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      })
    }

    // Delete associated Cloudinary images
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

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully"
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message
    })
  }
}


const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: -1 })

        if (!events || events.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No events found",
                data: []
            })
        }

        return res.status(200).json({
            success: true,
            message: "Events fetched successfully",
            data: events
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

const getSingleEvent = async (req , res) =>{
    try {
        const { eventId } = req.params
        if( !mongoose.Types.ObjectId.isValid(eventId)){
            return res.status(400).json({
                success: false,
                message: "Invalid event ID"
            })
        }
        const event = await Event.findById(eventId)
        if(!event){
            return res.status(404).json({
                success: false,
                message: "Event not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Event fetched successfully",
            data: event
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params
    const { title, description, date, location } = req.body

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID"
      })
    }

    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      })
    }

    
    event.title = title || event.title
    event.description = description || event.description
    event.date = date || event.date
    event.location = location || event.location

    
    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(
        req.files.map(img =>
          uploadToCloudinary(img.buffer, "event", "events").catch(() => ({ url: null, publicId: null }))
        )
      )

      const newImages = uploadResults.filter(r => r.url).map(r => ({ url: r.url, publicId: r.publicId }))

      
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

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    })
  }
}

export { createEvent, deleteEvent ,getAllEvents , getSingleEvent ,updateEvent}