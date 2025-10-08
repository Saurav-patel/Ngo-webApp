import mongoose, { Schema } from "mongoose"

const eventSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        default: "" 
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    location: { 
        type: String, 
        default: "" 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true 
    },
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }],
    participantEmails: [{ 
        type: String,
        lowercase: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    }],
    certificateIssued: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true })


eventSchema.index({ startDate: 1 })
eventSchema.index({ endDate: 1 })
eventSchema.index({ createdBy: 1 })
eventSchema.index({ participants: 1 })



const Event = mongoose.model("Event", eventSchema)

export default Event
