import mongoose, { Schema } from "mongoose";

const participationSchema = new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    eventId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Event",
        
    },
    status: {
    type: String,
    enum: ['registered', 'attended', 'cancelled'],
    default: 'registered'
   },
   certificateId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Certificate",
        
        
   }
}, { timestamps: true })
participationSchema.index({ userId: 1, eventId: 1 }, { unique: true })

export const Participation = mongoose.model("Participation" , participationSchema)