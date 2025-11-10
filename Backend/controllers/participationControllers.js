import mongoose from "mongoose";
import { Participation } from "../Models/participationModel.js";
import  Event  from "../Models/eventModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerParticipant = async (req, res) => {
  try {
    const { eventId } = req.params
    const userId = req.user?._id

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: User not logged in" 
      })
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid event ID" 
      })
    }

    const eventExists = await Event.exists({ _id: eventId })
    if (!eventExists) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      })
    }

    const alreadyRegistered = await Participation.findOne({ userId, eventId })
    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "User is already registered for this event"
      })
    }

    const participation = await Participation.create({ userId, eventId, status: "registered" })

    return res.status(201).json({
      success: true,
      message: "Participant registered successfully",
      data: participation
    })
  } catch (error) {
    console.error("Error in registerParticipant:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

const allParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" })
    }

    const eventExists = await Event.exists({ _id: eventId })
    if (!eventExists) {
      return res.status(404).json({ success: false, message: "Event not found" })
    }

    const participants = await Participation.find({ eventId })
      .populate("userId", "name email phone")
      .select("userId status createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    if (!participants.length) {
      return res.status(404).json({
        success: false,
        message: "No participants found for this event",
        data: []
      })
    }

    return res.status(200).json({
      success: true,
      message: "Participants fetched successfully",
      data: participants
    })
  } catch (error) {
    console.error("Error in allParticipants:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

const userParticipation = async (req, res) => {
    try {
        const { userId } = req.params
        const user = req.user
        if(user.role !== 'admin'){
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admins only"
            })
        }
        if(!userId){
            return res.status(400).json({
                success: false,
                message: "Please provide user ID"
            })
        }
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            })
        }
        const participations = await Participation.find({ userId })
        .populate("eventId", "title date location startDate endDate")
        .populate("certificateId", "certificateType issuedAt")
        .select("-__v")
        .sort({ createdAt: -1 })
        if(!participations.length){
            return res.status(404).json({
                success: false,
                message: "No events found for this user"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Events fetched successfully",
            data: participations
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

const myParticipation = async (req , res) => {
    try {
        const userId = req.user?._id
        if(!userId){
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not logged in"
            })
        }
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            })
        }   
        const participations = await Participation.find({ userId })
        .populate("eventId", "title date location startDate endDate")
        .populate("certificateId", "certificateType issuedAt")
        .select("-__v")
        .sort({ createdAt: -1 })
        if(!participations.length){
            return res.status(404).json({
                success: false,
                message: "No events found for this user"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Events fetched successfully",
            data: participations
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
const updateStatus = async (req , res) => {
    try {
        const { participationId } = req.params
        const { status } = req.body
        const user = req.user
        if(user.role !== 'admin'){
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admins only"
            })
        }
        const allowedStatuses = ['registered', 'attended', 'cancelled']
         
        if(!participationId || !status){
            return res.status(400).json({
                success: false,
                message: "Please provide participation ID and status"
            })
        }
        if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ 
            success: false, 
            message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}` 
        })
        }
        if(!mongoose.Types.ObjectId.isValid(participationId)){
            return res.status(400).json({
                success: false,
                message: "Invalid participation ID"
            })
        }
        const participation = await Participation.findById(participationId)
        if(!participation){
            return res.status(404).json({
                success: false,
                message: "Participation not found"
            })
        }
        participation.status = status
        await participation.save()
        return res.status(200).json({
            success: true,
            message: "Participation status updated successfully",
            data: participation
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
export { registerParticipant, allParticipants , userParticipation , updateStatus , myParticipation }
