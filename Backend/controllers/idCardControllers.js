import mongoose from "mongoose"
import IDCARD from "../Models/idCardModel.js"
import { uploadToCloudinary, cloudinary } from "../utils/cloudConfig.js"
import generateIDCard from "../utils/cardGenerateConfig.js"
import generateQR from "../utils/qrGenerateConfig.js"
import Ngo from "../Models/ngoModel.js"
import path from "path"

const applyIdCard = async (req, res) => {
  try {
    const userId = req.user?._id
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please log in again."
      })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format."
      })
    }

    
    const existingCard = await IDCARD.findOne({ issuedTo: userId })
    if (existingCard) {
      return res.status(400).json({
        success: false,
        message: "You already have an ID card issued."
      })
    }

    const ngo = await Ngo.findOne()
    if (!ngo) {
      return res.status(500).json({
        success: false,
        message: "NGO information missing. Cannot issue ID Card."
      })
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

    
    const idCardBuffer = await generateIDCard({
      ngo,
      name: req.user.name,
      position: normalizedRole || "Member",
      profilePicUrl: req.user.profilePic || path.resolve("public/default-avatar.jpg"),
      cardNumber,
      expiryDate: expiryDateObj.toLocaleDateString("en-IN"),
      qrBuffer
    })

    
    const uploadResult = await uploadToCloudinary(
      idCardBuffer,
      `idcard-${userId}`,
      "idcards"
    )

    
    const newIdCard = await IDCARD.create({
      issuedTo: userId,
      cardNumber,
      position: normalizedRole|| "Member",
      qrCodeData: qrData,
      expiryDate: expiryDateObj,
      status: "active",
      fileUrl: uploadResult.url,
      filePublicId: uploadResult.publicId
    })

    return res.status(201).json({
      success: true,
      message: "ID Card issued successfully.",
      data: {
        cardNumber: newIdCard.cardNumber,
        expiryDate: newIdCard.expiryDate,
        fileUrl: newIdCard.fileUrl
      }
    })
  } catch (error) {
    console.error("❌ ID Card Generation Error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Failed to generate ID card.",
      error: error.message
    })
  }
}

const renewIdCard = async (req, res) => {
  try {
    const { cardId } = req.params

    
    if (!cardId || !mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing card ID"
      })
    }

    
    const idCard = await IDCARD.findById(cardId).populate("issuedTo")
    if (!idCard) {
      return res.status(404).json({
        success: false,
        message: "ID Card not found"
      })
    }

    const ngo = await Ngo.findOne()
    if (!ngo) {
      return res.status(500).json({
        success: false,
        message: "NGO information not found. Cannot renew ID Card."
      })
    }

    
    if (idCard.filePublicId) {
      await cloudinary.uploader.destroy(idCard.filePublicId)
    }

    const cardNumber = idCard.cardNumber

    
    const qrBuffer = await generateQR(
      `ID:${cardNumber};IssuedTo:${idCard.issuedTo.name}`
    )

    
    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)

    const idCardBuffer = await generateIDCard({
      ngo,
      name: idCard.issuedTo.name,
      position: idCard.issuedTo.role || "Member",
      profilePicUrl:
        idCard.issuedTo.profilePic || "https://via.placeholder.com/100",
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

    
    return res.status(200).json({
      success: true,
      message: "ID Card renewed successfully",
      data: idCard
    })
  } catch (error) {
    console.error("Renew ID Card Error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    })
  }
}

const getMyIdCard = async (req, res) => {
  try {
    const {userId} = req.params
    const user = req.user

    console.log(userId)
    console.log(user._id)
    if(userId!==user._id.toString()){
      return  res.status(403).json({ 
        success: false,
        message: "Forbidden: You can only access your own ID Card" 
    })
    }
    if (!userId) {
        return res.status(401).json({ 
        success: false, 
        message: "Please provide user ID to fetch ID Card" 
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
    const user = req.user
    const { cardId } = req.params
    if (!user || user.role !== "admin"){ 
        return res.status(403).json({ 
        success: false,
        message: "Forbidden: Admins only" 
    })
    }
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
