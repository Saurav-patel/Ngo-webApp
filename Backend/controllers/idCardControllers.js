import mongoose from "mongoose"
import IDCARD from "../Models/idCardModel.js"
import { uploadToCloudinary, cloudinary } from "../utils/cloudConfig.js"
import generateIDCard from "../utils/cardGenerateConfig.js"
import generateQR from "../utils/qrGenerateConfig.js"
import Ngo from "../Models/ngoModel.js"

const applyIdCard = async (req, res) => {
  try {
    const userId = req.user?._id
    if (!userId) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized" 
        })
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid user ID" 
        })}

    const existingCard = await IDCARD.findOne({ issuedTo: userId })
    if (existingCard) {
        return res.status(400).json({ 
            success: false, 
            message: "You already have an ID Card issued." 
        })}

    const cardNumber = `ID-${Date.now()}`

    
    const qrBuffer = await generateQR(`ID:${cardNumber};IssuedTo:${req.user.name}`)

    
    const idCardBuffer = await generateIDCard({
      name: req.user.name,
      position: req.user.role || "Member",
      profilePicUrl: req.user.profilePic || "https://via.placeholder.com/100",
      cardNumber,
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString(),
      qrBuffer
    })

    
    const uploadResult = await uploadToCloudinary(idCardBuffer, `idcard-${userId}`, "idcards")

    
    const newIdCard = await IDCARD.create({
      issuedTo: userId,
      cardNumber,
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: "active",
      fileUrl: uploadResult.url,
      filePublicId: uploadResult.publicId
    })

    return res.status(201).json({
      success: true,
      message: "ID Card issued successfully",
      data: newIdCard
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ 
        success: false, 
        message: "Internal Server Error", 
        error: error.message 
    })
  }
}

const renewIdCard = async (req, res) => {
  try {
    const { cardId } = req.params
    if (!cardId) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide card ID to renew" 
        })
    }
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid card ID" 
        })
    }

    const idCard = await IDCARD.findById(cardId).populate("issuedTo")
    if (!idCard) {
        return res.status(404).json({ 
            success: false, 
            message: "ID Card not found" 
        })
    }

    
    if (idCard.filePublicId) {
      await cloudinary.uploader.destroy(idCard.filePublicId)
    }

    const cardNumber = idCard.cardNumber

    
    const qrBuffer = await generateQR(`ID:${cardNumber};IssuedTo:${idCard.issuedTo.name}`)
    const idCardBuffer = await generateIDCard({
      name: idCard.issuedTo.name,
      position: idCard.issuedTo.role || "Member",
      profilePicUrl: idCard.issuedTo.profilePic || "https://via.placeholder.com/100",
      cardNumber,
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString(),
      qrBuffer
    })

    
    const uploadResult = await uploadToCloudinary(idCardBuffer, `idcard-${idCard.issuedTo._id}`, "idcards")

    
    idCard.expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    idCard.status = "active"
    idCard.fileUrl = uploadResult.url
    idCard.filePublicId = uploadResult.publicId
    await idCard.save()

    return res.status(200).json({
      success: true,
      message: "ID Card renewed successfully",
      data: idCard
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ 
        success: false, 
        message: "Internal Server Error", 
        error: error.message })
  }
}

const getMyIdCard = async (req, res) => {
  try {
    const userId = req.user?._id
    if (!userId) {
        return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
    })
    }
    if (!mongoose.Types.ObjectId.isValid(userId)){ 
        return res.status(400).json({ 
            success: false, 
            message: "Invalid user ID" 
        })
    }
    const myIdCard = await IDCARD.findOne({ issuedTo: userId })
    if (!myIdCard){ 
        return res.status(404).json({ 
        success: false, 
        message: "No ID Card found for this user" 
    })
    }
    return res.status(200).json({
      success: true,
      message: "ID Card fetched successfully",
      data: myIdCard
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ 
        success: false, 
        message: "Internal Server Error", 
        error: error.message })
  }
}

const getAllIdCards = async (req, res) => {
  try {
    const admin = req.user
    if (!admin || admin.role !== "admin"){ 
        return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Admins only" 
    })
    }
    const allIdCards = await IDCARD.find().populate("issuedTo", "name email role").sort({ createdAt: -1 })
    return res.status(200).json({
      success: true,
      message: allIdCards.length ? "ID Cards fetched successfully" : "No ID Cards found",
      data: allIdCards
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ 
        success: false, 
        message: "Internal Server Error", 
        error: error.message 
    })
  }
}

const getSingleIdCard = async (req, res) => {
  try {
    const { cardId } = req.params
    if (!cardId){ 
        return res.status(400).json({ 
        success: false, 
        message: "Please provide card ID" 
    })
}
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
        return res.status(400).json({ 
        success: false, 
        message: "Invalid card ID" 
    })}

    const idCard = await IDCARD.findById(cardId).populate("issuedTo", "name email role")
    if (!idCard) return res.status(404).json({ 
        success: false, 
        message: "ID Card not found" 
    })

    return res.status(200).json({
      success: true,
      message: "ID Card fetched successfully",
      data: idCard
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ 
        success: false, 
        message: "Internal Server Error", 
        error: error.message 
    })
  }
}

export { applyIdCard, renewIdCard, getMyIdCard, getAllIdCards, getSingleIdCard }
