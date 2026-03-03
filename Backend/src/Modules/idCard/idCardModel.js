import mongoose, { Schema } from "mongoose"

const idCardSchema = new Schema({
  
  issuedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  filePublicId: {
    type: String,
    default: null
  },
  qrCodeData: {
    type: String,
    required: true,
    unique: true
  },
  cardNumber: {
    type: String,
    unique: true,
    required: true
  },
  position: {
    type: String,
    enum: ['Member', 'Secretary', 'Treasurer', 'President' , 'Vice President' , 'Staff' , 'Volunteer'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  }
}, { timestamps: true })

const IDCARD =  mongoose.model("IDCard", idCardSchema)
export default IDCARD