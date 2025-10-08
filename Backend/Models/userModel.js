import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const userSchema = new Schema({
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        match:
             /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    role:{
        type: String,
        enum: ['admin','member'],
        default: 'member'
    },
    address:{
        type: String
    },
    phone:{
        type: String,
        required: [true, "Phone number is required"],
        match: /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
    },
    profile_pic_url:{
        type: String
    },
    id_card_url:{
        type: String
    },
    appointmentLetterUrl:{
         type: String
    },    
    certificateUrl:{ 
        type: String 
    },    
    qrCode:{ 
    type: String 
    },    

    isActive:{ 
        type: Boolean, 
        default: true 
    }, 
    validity:{ 
        type: Date 
    },                   
    createdBy:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }


},{timestamps : true})

userSchema.pre("save",async function (next){
    if(this.isModified("password")){
    this.password=await bcrypt.hash(this.password,10)}
    
    next()
})
userSchema.methods.generateAccessToken = function() {
    const accessToken = jwt.sign({
        _id: this._id, 
        email: this.email,
        username: this.username,
        role:this.role || 'member'
        
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
       expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
    
    return accessToken
}

const User = mongoose.model("User",userSchema)

export default User