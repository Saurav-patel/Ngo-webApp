import User from "../Models/userModel.js";
import Donation from "../Models/donationModel.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../utils/cloudConfig.js";
import Document from "../Models/documentModel.js";
import Ngo from "../Models/ngoModel.js";

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const totalUsers = await User.countDocuments()

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      page,
      limit,
      totalUsers,
      data: users
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

const deleteUser = async (req, res) => {
  try {
    const userId= req.params

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Please provide user ID to delete a user"
      })
    }

    if(!mongoose.Types.ObjectId.isValid(userId)){
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      })
    }

    const user = await User.findOne({ userId })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User is already inactive"
      });
    }

    await User.findByIdAndUpdate(user._id, { isActive: false })
    await uploadToCloudinary.deleteFromCloudinary(user.profile_pic_url?.publicId)

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully"
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

const getMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50

    
    const members = await User.find({
      registerNumber: { $exists: true },
      isActive: true,
      validity: { $gte: new Date() }
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    
    const membersWithVerifiedDonation = []

    for (const member of members) {
      const donation = await Donation.findOne({
        donor: member._id,
        isVerified: true
      }).sort({ date: -1 })

      if (donation) {
        membersWithVerifiedDonation.push({
          ...member.toObject(),
          latestDonation: {
            amount: donation.amount,
            date: donation.date
          }
        })
      }
    }

    if (membersWithVerifiedDonation.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No members found"
      })
    }

    const totalMembers = membersWithVerifiedDonation.length;

    return res.status(200).json({
      success: true,
      message: "Members fetched successfully",
      page,
      limit,
      totalMembers,
      data: membersWithVerifiedDonation
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

const uploadNgoDocuments = async (req , res) => {
  try {
    const user = req.user
    const files = req.files
    const {title , description} = req.body
    if(!user || user.role !== "admin"){
        return res.status(403).json({
            success: false,
            message: "Forbidden: Admins only"
        })
    }
    if(!files || files.length === 0){
        return res.status(400).json({
            success: false,
            message: "Please upload at least one document"
        })
    }
    if (files.map(f => f.mimetype).some(mime => !['application/pdf', 'image/jpeg', 'image/png'].includes(mime))) {
        return res.status(400).json({
            success: false,
            message: "Only PDF, JPEG, and PNG files are allowed"
        })
    }
    if(!title || !description){
        return res.status(400).json({
            success: false,
            message: "Please provide title and description for the document"
        })
    }
     const uploadedFiles = await Promise.all(
      files.map(file => uploadToCloudinary(file.path, "ngo-documents"))
    )

    
    const fileUrlArray = uploadedFiles.map(f => ({
      url: f.secure_url,
      publicId: f.public_id
    }))

    const newDocument = await Document.create({
      title,
      description,
      fileUrl: fileUrlArray,
      uploadedBy: user._id
    })
    return res.status(201).json({
        success: true,
        message: "Documents uploaded successfully",
        data: newDocument
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

const addMemberInfo = async (req , res) => {
  try {
    const user = req.user
    const { name ,email , phone , address , city , designation ,dob} = req.body
    const files = req.files
    if(!user || user.role !== "admin"){
        return res.status(403).json({
            success: false,
            message: "Forbidden: Admins only"
        })
    }
    if(!name || !email || !phone || !address || !city || !designation || !dob){
        return res.status(400).json({
            success: false,
            message: "Please provide all required member details"
        })
    }
    if(!files || files.length === 0){
        return res.status(400).json({
            success: false,
            message: "Please upload member photo"
        })
    }
    const dobDate = new Date(dob);
    if (isNaN(dobDate)){ 
      return res.status(400).json({ 
      success: false, 
      message: 'Invalid DOB format' 
    })
  }

    const uploadedPhoto = await uploadToCloudinary(files[0].path, "member-photos")

    const fileUrl = {
      url: uploadedPhoto.secure_url,
      publicId: uploadedPhoto.public_id
    }
    const ngo = await Ngo.findOne()
    if(!ngo){
        return res.status(404).json({
            success: false,
            message: "NGO not found"
        })
    }
    const newMember = {
      name,
      email,
      phone,
      address,
      city,
      designation,
      dob,
      photo: fileUrl,
    }
    ngo.members.push(newMember)
    await ngo.save()
    return res.status(201).json({
        success: true,
        message: "Member added successfully",
        data: newMember
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

const deleteMember = async (req , res) => {
  try {
    const user = req.user
    const { memberId } = req.params
    if(!user || user.role !== "admin"){
        return res.status(403).json({
            success: false,
            message: "Forbidden: Admins only"
        })
    }
    if(!memberId){
        return res.status(400).json({
            success: false,
            message: "Please provide member ID to delete a member"
        })
    }
    const ngo = await Ngo.findOne()
    if(!ngo){
        return res.status(404).json({
            success: false,
            message: "NGO not found"
        })
    }
    const member = ngo.members.id(memberId)
    if(!member){
        return res.status(404).json({
            success: false,
            message: "Member not found"
        })
    }

    if(member.photo && member.photo.publicId){
      await uploadToCloudinary.deleteFromCloudinary(member.photo.publicId)
    }

    member.deleteOne()
    await ngo.save()
    return res.status(200).json({
        success: true,
        message: "Member deleted successfully"
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

export { getAllUsers, deleteUser, getMembers , uploadNgoDocuments , addMemberInfo , deleteMember }
