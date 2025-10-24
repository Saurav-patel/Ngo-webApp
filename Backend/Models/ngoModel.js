import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    designation: { 
        type: String, 
        required: true 
    }, 
    email: { 
        type: String, 
        lowercase: true 
    },
    phone: { 
        type: String 
    },
    photo: { 
        url:{ type: String},
        publicId:{ type: String}
    },
    aadharNumber: { 
        type: String, 
        unique: true
    },
    address: { 
        type: String,
        required: true
    },
    city: { 
        type: String,
        required: true
    },
    dob: { 
        type: Date,
        required: true
    }
})

const ngoSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    registrationNumber: { 
        type: String, 
        required: true 
    },
    address: { 
        type: String, 
        required: true 
    },
    contactEmail: {
        type: String,
        required: true,
        lowercase: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    contactPhone: {
        type: String,
        required: true,
        match: /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
    },
    establishedDate: { 
        type: Date, 
        required: true 
    },
    missionStatement: { 
        type: String, 
        default: "" 
    },
    visionStatement: { 
        type: String, 
        default: "" 
    },
    logoUrl: { 
        type: String, 
        default: "" 
    },
    members: [memberSchema] 
}, { timestamps: true });

const Ngo = mongoose.model("NGO", ngoSchema)
export default Ngo
