import User from "../Models/userModel.js"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      throw new ApiError(400, "Please provide all required fields")
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new ApiError(400, "User with this email already exists")
    }

    const user = await User.create({
      username: name,
      email,
      password,
      role: "member"
    })

    const responseData = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    }

    return res
      .status(201)
      .json(new ApiResponse(201, responseData, "User registered successfully"))
  } catch (error) {
    next(error)
  }
}

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      throw new ApiError(400, "Please provide all required fields")
    }

    const existingAdmin = await User.findOne({ email })
    if (existingAdmin) {
      throw new ApiError(400, "Admin with this email already exists")
    }

    const admin = await User.create({
      username: name,
      email,
      password,
      role: "admin"
    })

    const responseData = {
      id: admin._id,
      email: admin.email,
      username: admin.username,
      role: admin.role
    }

    return res
      .status(201)
      .json(new ApiResponse(201, responseData, "Admin created successfully"))
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new ApiError(400, "Please provide email and password")
    }

    const user = await User.findOne({ email })
    if (!user) {
      throw new ApiError(400, "User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid credentials")
    }

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
    const responseData = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      accessToken
    }

    return res
      .status(200)
      .json(new ApiResponse(200, responseData, "Login successful"))
  } catch (error) {
    next(error)
  }
}

const refreshAccessToken = async (req, res, next) => {
  try {
    const user = req.user

    if (!user) {
      throw new ApiError(401, "User is missing or invalid")
    }

    const newAccessToken = jwt.sign(
      { _id: user._id, email: user.email, username: user.username, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )

    return res
      .status(200)
      .json(new ApiResponse(200, { accessToken: newAccessToken }, "New access token generated"))
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict"
    })

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logged out successfully"))
  } catch (error) {
    next(error)
  }
}

const getCurrentUser = async (req ,res  , next ) => {
  try {
    const user = req.user
    if(!user){
      throw new ApiError(401 , "User is missing , please login again")
    }
    const currentUser = await User.findById(user._id).populate('username email role _id')
    if(!currentUser){
      throw new ApiError(404 , "User not found")
    }

    return res.status(200)
    .json(new ApiResponse(200 , currentUser , "Current user fetched successfully"))

  } catch (error) {
    next(error)
  }
}
export { login, refreshAccessToken, logout, signUp, createAdmin , getCurrentUser }
