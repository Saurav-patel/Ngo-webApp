import mongoose, { Schema } from "mongoose"

const visitorSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        lowercase: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        required: true
    },
    phone: { 
        type: String,
        match: /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
    },
    address: { 
        type: String, 
        default: "" 
    },
    donations: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Donation" 
    }],
    events: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Event" 
    }],
    certificates: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Certificate" 
    }],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }
}, { timestamps: true })


visitorSchema.index({ email: 1 }, { unique: true })
visitorSchema.index({ phone: 1 }, { unique: true })



const Visitor = mongoose.model("Visitor", visitorSchema)

export default Visitor
