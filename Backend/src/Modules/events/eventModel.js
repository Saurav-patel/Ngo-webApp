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
    
    location: { 
        type: String, 
        default: "" 
    },
     photos: [{
    url: { type: String },
    publicId: { type: String }
    }],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true 
    },
    
   

    
}, { timestamps: true })






const Event = mongoose.model("Event", eventSchema)

export default Event
