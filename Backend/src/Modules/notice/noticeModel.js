import mongoose, { Schema } from "mongoose"

const noticeSchema = new Schema(
  {
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    body: { 
        type: String, 
        required: true 
    },
    category: { 
      type: String, 
      enum: ["General", "Event", "Urgent"], 
      default: "General" 
    },
    isPinned: { 
        type: Boolean, 
        default: false 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    sentAt: { 
        type: Date, 
        default: Date.now 
    },
    expiresAt: { 
        type: Date, 
        default: null 
    }
  },
  { timestamps: true }
)

const Notice =  mongoose.model("Notice", noticeSchema)

export default Notice