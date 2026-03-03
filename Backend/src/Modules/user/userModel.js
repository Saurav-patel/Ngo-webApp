import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const userSchema = new Schema({
    registerNumber:{
        type: String,
    },
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
    refreshToken: {
    type: String,
    default: null,
    },
    dob:{
        type: Date,
        //required: [true, "Date of Birth is required"]
    },
    aadhaarNumber:{
        type: String,
       // required: [true, "Aadhaar Number is required"],
        
        
    },
    role:{
        type: String,
        enum: ['admin',"user"],
        default: 'user'
    },
    address:{
        type: String
    },
    city:{
        type: String,
        //required: true
    },
    fatherName:{
        type: String,
        
    },
    
    phone:{
        type: String,
       
        match: /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
    },
    profile_pic_url:{
        url : { type: String },
        publicId : { type: String }
    },
   
    isActive:{ 
        type: Boolean, 
        default: true 
    }, 
    validity:{ 
        type: Date,
        default: null 
    },                   
    

},{timestamps : true})

userSchema.index(
  { aadhaarNumber: 1 },
  { unique: true, partialFilterExpression: { aadhaarNumber: { $type: "string" } } }
)



userSchema.pre("save",async function (next){
    if(this.isModified("password")){
    this.password=await bcrypt.hash(this.password,10)}
    
    next()
})

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id, 
        email: this.email,
        username: this.username,
        role:this.role || 'member' },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY ,
    }
  )
}
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role || 'member'
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}


const User = mongoose.model("User",userSchema)

export default User