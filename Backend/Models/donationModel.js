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
        type: String 
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
        type: String 
    }, 
    receiptUrl: { 
        type: String,
        default: "", 
    },   
    qrCode: { 
        type: String,
        default: "", 
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    }
})

const Donation = mongoose.model("Donation" , donationSchema)

export default Donation