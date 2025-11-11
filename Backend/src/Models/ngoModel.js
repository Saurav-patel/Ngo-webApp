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
    default: "BRIGHT FUTURE FOUNDATION",
    immutable: true
  },
  registrationNumber: {
    type: String,
    default: "2024/4/IV/1678",
    immutable: true
  },
  address: {
    type: String,
    default: "Patna City, Bihar, India"
  },
  contactEmail: {
    type: String,
    default: "brightfuture@gmail.com",
    lowercase: true
  },
  contactPhone: {
    type: String,
    default: "+919876543210"
  },
  establishedDate: {
    type: Date,
    default: new Date("2024-10-05"),
    immutable: true
  },
  missionStatement: {
    type: String,
    default: "To empower underprivileged communities through education, healthcare, and sustainable development."
  },
  visionStatement: {
    type: String,
    default: "Creating a world where every individual has the opportunity to thrive and contribute positively to society."
  },
  logoUrl: {
    type: String,
    default: ""
  },
  members: [memberSchema]
}, { timestamps: true })



const Ngo = mongoose.model("NGO", ngoSchema)
export default Ngo
