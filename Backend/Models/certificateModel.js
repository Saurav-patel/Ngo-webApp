import mongoose, { Schema } from "mongoose"

const certificateSchema = new Schema({
    issuedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: false 
    },
    name: { 
        type: String,
        required: function() { return !this.issuedTo } 
    },
    email: { 
        type: String,
        lowercase: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        required: function() { return !this.issuedTo } 
    },
    type: { 
        type: String, 
        enum: ['Membership', 'Appointment', 'Donation', 'EventParticipation'], 
        required: true 
    },
    issueDate: { 
        type: Date, 
        default: Date.now 
    },
    qrCode: { 
        type: String, 
        default: "" 
    },
    fileUrl: { 
        type: String, 
        default: "" 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }
}, { timestamps: true })

const Certificate = mongoose.model("Certificate", certificateSchema)

export default Certificate
