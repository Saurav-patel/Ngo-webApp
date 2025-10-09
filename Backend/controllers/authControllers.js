import User from "../Models/userModel.js";
import jwt from "jsonwebtoken"

const login = async (req , res) => {
    try {
        const {email , password} = req.body
        if(!email || !password){
            return res.status(400).json({message: "Please provide email and password"})
        }
        const user = await User.findOne({email: email}) 
        if(!user){
            return res.status(400).json({message: "User not found"})
        }
        const isPasswordCorrect = await user.isPasswordCorrect(password)
        if(!isPasswordCorrect){
        return res.status(400).json({message: "Invalid credentials"})
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
            message: "Login successful", 
            data:{
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                
            },
            accessToken

        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Internal server error"})
    }
}

const refreshAccessToken = async (req, res) => {
   
    const user = req.user

    if (!user) {
        return res.status(401).json({ message: "user is missing" })
    }

    const newAccessToken = jwt.sign(
    { _id: user._id, email: user.email, username: user.username, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )

    return res.status(200).json({
        message: "New access token generated",
        accessToken: newAccessToken
    })
}

const logout = async (req , res ) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict"
    })
    return res.status(200).json({message: "Logged out successfully"})
}



export { login , refreshAccessToken , logout}