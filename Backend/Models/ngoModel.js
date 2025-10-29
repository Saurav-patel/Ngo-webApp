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
    name: "BRIGHT FUTURE FOUNDATION",
   
    registrationNumber: "2024/4/IV/1678",
    address: "Patna City, Bihar, India",
    contactEmail: "brightfuture@gmail.com",
    contactPhone: "+919876543210",
    establishedDate: new Date("2024-10-05"),
    missionStatement: "To empower underprivileged communities through education, healthcare, and sustainable development.",
    visionStatement: "Creating a world where every individual has the opportunity to thrive and contribute positively to society.",
    logoUrl: { 
        type: String, 
        default: "" 
    },
    members: [memberSchema] 
}, { timestamps: true });

const Ngo = mongoose.model("NGO", ngoSchema)
export default Ngo
