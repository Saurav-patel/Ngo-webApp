import mongoose, { Schema } from "mongoose";

const appointmentLetterSchema = new Schema({
    issuedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content:{
        type: String,
        required: true
    },
    issueDate:{
        type: Date,
        default: Date.now
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    generated:{
        type: Boolean,
        default: false
    },
    fileUrl:{
        type: String,
        
        default: null
    },
      filePublicId: {
    type: String, 
    default: null
  }

}, { timestamps: true })


appointmentLetterSchema.index({ issuedTo: 1 })
appointmentLetterSchema.index({ generated: 1 })


const AppointmentLetter = mongoose.model("AppointmentLetter", appointmentLetterSchema)
export default AppointmentLetter