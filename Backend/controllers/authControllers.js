import User from "../Models/userModel.js";
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const signUp = async (req , res) => {
    try {
        const {name , email , password ,} = req.body
        if(!name || !email || !password ){
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            })
        }
        const existingUser = await User.findOne({email: email})
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            })
        }
        const user = await User.create({
            username: name,
            email: email,
            password: password,
            role: "member"
        })
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data:{
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

const createAdmin = async (req , res) => {
    try {
        const {name , email , password ,} = req.body
        if(!name || !email || !password ){
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            })
        }
        const admin = await User.create({
            username: name,
            email: email,
            password: password,
            role: "admin"
        })
        return res.status(201).json({
            success: true,
            message: "Admin created successfully",
            data:{
                id: admin._id,
                email: admin.email,
                username: admin.username,
                role: admin.role
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}
    
const login = async (req , res) => {
    try {
        const {email , password} = req.body
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            })
        }
        const user = await User.findOne({email: email}) 
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found"
                
            })
        }
        const isPasswordCorrect = await user.isPasswordCorrect(password)
        if(!isPasswordCorrect){
        return res.status(400).json({
            success: false,
            message: "Invalid credentials"
            
        })
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        })
        return res.status(200).json({
            
            success: true,
            message: "Login successful", 
            data:{
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                accessToken
                
            },
            

        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const refreshAccessToken = async (req, res) => {
   
    const user = req.user

    if (!user) {
        return res.status(401).json({ 
            success: false,
            message: "user is missing"
         })
    }

    const newAccessToken = jwt.sign(
    { _id: user._id, email: user.email, username: user.username, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )

    return res.status(200).json({
        success: true,
        message: "New access token generated",
        data:{
            accessToken: newAccessToken
        }
    })
}

const logout = async (req , res ) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict"
    })
    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
}



export { login , refreshAccessToken , logout , signUp , createAdmin }