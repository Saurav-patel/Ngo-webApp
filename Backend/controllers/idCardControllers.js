import mongoose from "mongoose"
import IDCARD from "../Models/idCardModel.js"
import { uploadToCloudinary, cloudinary } from "../utils/cloudConfig.js"
import generateIDCard from "../utils/cardGenerateConfig.js"
import generateQR from "../utils/qrGenerateConfig.js"
import Ngo from "../Models/ngoModel.js"

const applyIdCard = async (req, res) => {
  try {
    // -------- Validate user --------
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

    // -------- Prevent duplicate ID cards --------
    const existingCard = await IDCARD.findOne({ issuedTo: userId })
    if (existingCard) {
      return res.status(400).json({
        success: false,
        message: "You already have an ID card issued."
      })
    }

    // -------- Get NGO info --------
    const ngo = await Ngo.findOne()
    if (!ngo) {
      return res.status(500).json({
        success: false,
        message: "NGO information missing. Cannot issue ID Card."
      })
    }

    // -------- Prepare card data --------
    const cardNumber = `ID-${Date.now()}`
    const expiryDateObj = new Date()
    expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1)

    // -------- Generate QR --------
    const qrData = `ID:${cardNumber};IssuedTo:${req.user.name};UserID:${userId}`
    const qrBuffer = await generateQR(qrData)

    // -------- Generate ID card image --------
    const idCardBuffer = await generateIDCard({
      ngo,
      name: req.user.name,
      position: req.user.role || "Member",
      profilePicUrl: req.user.profilePic || "https://via.placeholder.com/100",
      cardNumber,
      expiryDate: expiryDateObj.toLocaleDateString("en-IN"),
      qrBuffer
    })

    // -------- Upload to Cloudinary --------
    const uploadResult = await uploadToCloudinary(
      idCardBuffer,
      `idcard-${userId}`,
      "idcards"
    )

    // -------- Save to Database --------
    const newIdCard = await IDCARD.create({
      issuedTo: userId,
      cardNumber,
      expiryDate: expiryDateObj,
      status: "active",
      fileUrl: uploadResult.url,
      filePublicId: uploadResult.publicId
    })

    // -------- Success Response --------
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

    // 🔹 Validate card ID
    if (!cardId || !mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing card ID"
      })
    }

    // 🔹 Find the existing ID card and linked user
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

    // 🔹 Delete the old Cloudinary file if exists
    if (idCard.filePublicId) {
      await cloudinary.uploader.destroy(idCard.filePublicId)
    }

    const cardNumber = idCard.cardNumber

    // 🔹 Generate new QR code
    const qrBuffer = await generateQR(
      `ID:${cardNumber};IssuedTo:${idCard.issuedTo.name}`
    )

    // 🔹 Generate new ID card image
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

    // 🔹 Upload new image to Cloudinary
    const uploadResult = await uploadToCloudinary(
      idCardBuffer,
      `idcard-${idCard.issuedTo._id}`,
      "idcards"
    )

    // 🔹 Update database record
    idCard.expiryDate = expiryDate
    idCard.status = "active"
    idCard.fileUrl = uploadResult.url
    idCard.filePublicId = uploadResult.publicId
    await idCard.save()

    // ✅ Success
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
    const userId = req.params
    const user = req.user
    if(userId!==String(user._id)){
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
