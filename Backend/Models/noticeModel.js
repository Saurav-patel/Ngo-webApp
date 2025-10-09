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
        required: function() { return !this.isGlobal }
        
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



const Message = mongoose.model("Message", messageSchema)

export default Message
