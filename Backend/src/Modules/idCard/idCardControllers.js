import mongoose from "mongoose"
import IDCARD from "./idCardModel.js"
import { uploadToCloudinary, cloudinary } from "../../utils/cloudConfig.js"
import generateIDCard from "../../utils/cardGenerateConfig.js"
import { Membership } from "../membership/membershipModel.js"
import Ngo from "../ngo/ngoModel.js"

import { ApiError } from "../../utils/apiError.js"
import { ApiResponse } from "../../utils/apiResponse.js"
import User from "../user/userModel.js"

const applyIdCard = async (req, res, next) => {
 try {
  const userId = req.user?._id
  const membership = await Membership.findOne({ userId })
  if (!membership) {
    throw new ApiError(404, "Membership not found for the user. Please apply for membership first.")
  }

  const existingCard = await IDCARD.findOne({ issuedTo: userId })
  if (existingCard) {
    throw new ApiError(400, "ID Card already exists for this user. Please renew if you want to update.")
  }
   

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
      .json(new ApiResponse(200,   
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
