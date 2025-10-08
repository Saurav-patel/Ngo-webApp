import mongoose, { Schema } from "mongoose"

const messageSchema = new Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    recipients: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    }],
    title: { 
        type: String, 
        required: true 
    },
    body: { 
        type: String, 
        required: true 
    },
    isGlobal: { 
        type: Boolean, 
        default: false  
    },
    sentAt: { 
        type: Date, 
        default: Date.now 
    },
    readBy: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }]
}, { timestamps: true })


messageSchema.index({ sender: 1 })
messageSchema.index({ recipients: 1 })
messageSchema.index({ sentAt: -1 })

const Message = mongoose.model("Message", messageSchema)

export default Message
