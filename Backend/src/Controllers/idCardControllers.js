import mongoose from "mongoose"
import IDCARD from "../Models/idCardModel.js"
import { uploadToCloudinary, cloudinary } from "../utils/cloudConfig.js"
import generateIDCard from "../utils/cardGenerateConfig.js"
import generateQR from "../utils/qrGenerateConfig.js"
import Ngo from "../Models/ngoModel.js"
import path from "path"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import User from "../Models/userModel.js"

const applyIdCard = async (req, res, next) => {
  try {
    const userId = req.user?._id
    console.log("Applying ID Card for User ID:", userId)

    if (!userId) {
      throw new ApiError(401, "Unauthorized access. Please log in again.")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID format.")
    }

    const existingCard = await IDCARD.findOne({ issuedTo: userId })
    if (existingCard) {
      throw new ApiError(400, "You already have an ID card issued.")
    }

    const ngo = await Ngo.findOne()
    if (!ngo) {
      throw new ApiError(500, "NGO information missing. Cannot issue ID Card.")
    }

    // ✅ Require address & phone on profile
    const user = await User.findById(userId)
    const address = user?.address
    const phone = user?.phone
    
    if (!address || !phone) {
      throw new ApiError(
        400,
        "Please update your profile with address and phone number before applying for an ID Card."
      )
    }

    const cardNumber = `ID-${Date.now()}`
    const expiryDateObj = new Date()
    expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1)

    const qrData = `ID:${cardNumber};IssuedTo:${req.user.username};UserID:${userId}`
    const qrBuffer = await generateQR(qrData)

    const role = req.user.role || "Member"
    const normalizedRole =
      role === "Vice President"
        ? "Vice President"
        : role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()

    const profilePicUrl =
      req.user.profilePic || path.resolve("public/default-avatar.jpg")

    const idCardBuffer = await generateIDCard({
      ngo,
      name: user.username,
      position: normalizedRole || "Member",
      profilePicUrl,
      cardNumber,
      expiryDate: expiryDateObj.toLocaleDateString("en-IN"),
      qrBuffer,
      phone,
      address
    })

    const uploadResult = await uploadToCloudinary(
      idCardBuffer,
      `idcard-${userId}`,
      "idcards"
    )

    const newIdCard = await IDCARD.create({
      issuedTo: userId,
      cardNumber,
      position: normalizedRole || "Member",
      qrCodeData: qrData,
      expiryDate: expiryDateObj,
      status: "active",
      fileUrl: uploadResult.url,
      filePublicId: uploadResult.publicId
    })

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          cardNumber: newIdCard.cardNumber,
          expiryDate: newIdCard.expiryDate,
          fileUrl: newIdCard.fileUrl
        },
        "ID Card issued successfully."
      )
    )
  } catch (error) {
    next(error)
  }
}


const renewIdCard = async (req, res, next) => {
  try {
    const { cardId } = req.params

    if (!cardId || !mongoose.Types.ObjectId.isValid(cardId)) {
      throw new ApiError(400, "Invalid or missing card ID")
    }

    const idCard = await IDCARD.findById(cardId).populate("issuedTo")
    if (!idCard) {
      throw new ApiError(404, "ID Card not found")
    }

    const ngo = await Ngo.findOne()
    if (!ngo) {
      throw new ApiError(500, "NGO information not found. Cannot renew ID Card.")
    }

    if (idCard.filePublicId) {
      await cloudinary.uploader.destroy(idCard.filePublicId)
    }

    const cardNumber = idCard.cardNumber
    const qrBuffer = await generateQR(`ID:${cardNumber};IssuedTo:${idCard.issuedTo.name}`)

    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)

    const idCardBuffer = await generateIDCard({
      ngo,
      name: idCard.issuedTo.name,
      position: idCard.issuedTo.role || "Member",
      profilePicUrl: idCard.issuedTo.profilePic || "https://via.placeholder.com/100",
      cardNumber,
      expiryDate: expiryDate.toLocaleDateString(),
      qrBuffer
    })

    const uploadResult = await uploadToCloudinary(
      idCardBuffer,
      `idcard-${idCard.issuedTo._id}`,
      "idcards"
    )

    idCard.expiryDate = expiryDate
    idCard.status = "active"
    idCard.fileUrl = uploadResult.url
    idCard.filePublicId = uploadResult.publicId
    await idCard.save()

    return res
      .status(200)
      .json(new ApiResponse(200, idCard, "ID Card renewed successfully"))
  } catch (error) {
    next(error)
  }
}

const getMyIdCard = async (req, res, next) => {
  try {
    

    const userId = req.user?._id

    const myIdCard = await IDCARD.findOne({ issuedTo: userId })
    if (!myIdCard) {
      throw new ApiError(404, "No ID Card found for this user")
    }

    return res
      .status(200)
      .json(new ApiResponse(200,   200,
        myIdCard, 
        myIdCard
          ? "ID Card fetched successfully"
          : "ID Card not issued yet"))
  } catch (error) {
    next(error)
  }
}

const getAllIdCards = async (req, res, next) => {
  try {
    const admin = req.user
    if (!admin || admin.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    const allIdCards = await IDCARD.find()
      .populate("issuedTo", "name email role")
      .sort({ createdAt: -1 })

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          allIdCards,
          allIdCards.length ? "ID Cards fetched successfully" : "No ID Cards found"
        )
      )
  } catch (error) {
    next(error)
  }
}

const getSingleIdCard = async (req, res, next) => {
  try {
    const user = req.user
    const { cardId } = req.params

    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    if (!cardId) {
      throw new ApiError(400, "Please provide card ID")
    }

    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      throw new ApiError(400, "Invalid card ID")
    }

    const idCard = await IDCARD.findById(cardId).populate("issuedTo", "name email role")
    if (!idCard) {
      throw new ApiError(404, "ID Card not found")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, idCard, "ID Card fetched successfully"))
  } catch (error) {
    next(error)
  }
}

export { applyIdCard, renewIdCard, getMyIdCard, getAllIdCards, getSingleIdCard }
