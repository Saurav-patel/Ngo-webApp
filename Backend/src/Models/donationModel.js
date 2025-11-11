import mongoose, { Schema } from "mongoose";

const donationSchema = new Schema({
    donor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: false 
    },
    name: { 
        type: String 
    }, 
    email: { 
        type: String,
        lowercase: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    }, 
    amount: { 
        type: Number, 
        required: true 
    },
    paymentMethod: { 
        type: String, 
        enum: ['Razorpay', 'PhonePe', 'Cash'], 
        required: true 
    },
    transactionId: { 
        type: String ,
        unique: true
    }, 
    receiptUrl: { 
        type: String,
        default: null , 
    },   
    qrCode: { 
        type: String,
        default: null , 
        unique: true
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    }
},{ timestamps: true })



const Donation = mongoose.model("Donation" , donationSchema)

export default Donation