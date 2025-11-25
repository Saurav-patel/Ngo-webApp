import User from "../Models/userModel.js"
import Donation from "../Models/donationModel.js"
import mongoose from "mongoose"
import { uploadToCloudinary, cloudinary } from "../utils/cloudConfig.js"
import Document from "../Models/documentModel.js"
import Ngo from "../Models/ngoModel.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const getAllUsers = async (req, res, next) => {
  try {
    const admin = req.user
    if (!admin || admin.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const totalUsers = await User.countDocuments()

    return res
      .status(200)
      .json(new ApiResponse(200, { page, limit, totalUsers, users }, "Users fetched successfully"))
  } catch (error) {
    next(error)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params

    if (!userId) {
      throw new ApiError(400, "Please provide user ID to delete a user")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID")
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new ApiError(404, "User not found")
    }

    if (!user.isActive) {
      throw new ApiError(400, "User is already inactive")
    }

    await User.findByIdAndUpdate(user._id, { isActive: false })
    if (user.profile_pic_url?.publicId) {
      await uploadToCloudinary.deleteFromCloudinary(user.profile_pic_url.publicId)
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "User deactivated successfully"))
  } catch (error) {
    next(error)
  }
}

const getMembers = async (req, res, next) => {
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
      .limit(limit)

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
      throw new ApiError(404, "No members found")
    }

    const totalMembers = membersWithVerifiedDonation.length

    return res
      .status(200)
      .json(new ApiResponse(200, { page, limit, totalMembers, membersWithVerifiedDonation }, "Members fetched successfully"))
  } catch (error) {
    next(error)
  }
}

const uploadNgoDocuments = async (req, res, next) => {
  try {
    const user = req.user
    const files = req.files
    const { title, description } = req.body

    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    if (!files || files.length === 0) {
      throw new ApiError(400, "Please upload at least one document")
    }

    const invalidFiles = files
      .map(f => f.mimetype)
      .some(mime => !["application/pdf", "image/jpeg", "image/png"].includes(mime))

    if (invalidFiles) {
      throw new ApiError(400, "Only PDF, JPEG, and PNG files are allowed")
    }

    if (!title || !description) {
      throw new ApiError(400, "Please provide title and description for the document")
    }

    const uploadedFiles = await Promise.all(
      files.map(file => uploadToCloudinary(file.buffer, "ngo-documents"))
    )

    const fileUrlArray = uploadedFiles.map(f => ({
      url: f.url,
      publicId: f.publicId
    }))

    const newDocument = await Document.create({
      title,
      description,
      fileUrl: fileUrlArray,
      uploadedBy: user._id
    })

    return res
      .status(201)
      .json(new ApiResponse(201, newDocument, "Documents uploaded successfully"))
  } catch (error) {
    next(error)
  }
}

const addMemberInfo = async (req, res, next) => {
  try {
    const user = req.user
    const { name, email, phone, address, city, designation, dob } = req.body
    const file = req.file

    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    if (!name || !email || !phone || !address || !city || !designation || !dob) {
      throw new ApiError(400, "Please provide all required member details")
    }

    if (!file) {
      throw new ApiError(400, "Please upload member photo")
    }

    const dobDate = new Date(dob)
    if (isNaN(dobDate)) {
      throw new ApiError(400, "Invalid DOB format")
    }

    let ngo = await Ngo.findOne()
    if (!ngo) {
      ngo = await Ngo.create({})
    }

    const existingMember = ngo.members.find(m => m.email.toLowerCase() === email.toLowerCase())
    if (existingMember) {
      throw new ApiError(400, "Member with this email already exists")
    }

    const uploadedPhoto = await uploadToCloudinary(file.buffer, "member-photos")
    const fileUrl = { url: uploadedPhoto.url, publicId: uploadedPhoto.publicId }

    const newMember = {
      name,
      email,
      phone,
      address,
      city,
      designation,
      dob,
      photo: fileUrl
    }

    ngo.members.push(newMember)
    await ngo.save()

    return res
      .status(201)
      .json(new ApiResponse(201, newMember, "Member added successfully"))
  } catch (error) {
    next(error)
  }
}

const updateMemberInfo = async (req, res, next) => {
  try {
    const user = req.user
    const { memberId } = req.params
    const { name, email, phone, address, city, designation, dob } = req.body
    const file = req.file

    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    if (!memberId) {
      throw new ApiError(400, "Please provide member ID to update member info")
    }

    const ngo = await Ngo.findOne()
    if (!ngo) {
      throw new ApiError(404, "NGO not found")
    }

    const member = ngo.members.find(m => m._id.toString() === memberId)
    if (!member) {
      throw new ApiError(404, "Member not found")
    }

    if (name) member.name = name
    if (email) member.email = email
    if (phone) member.phone = phone
    if (address) member.address = address
    if (city) member.city = city
    if (designation) member.designation = designation
    if (dob) member.dob = new Date(dob)

    if (file) {
      if (member.photo?.publicId) {
        await uploadToCloudinary.deleteFromCloudinary(member.photo.publicId)
      }

      const uploadedPhoto = await uploadToCloudinary(file.buffer, "member-photos")
      member.photo = { url: uploadedPhoto.url, publicId: uploadedPhoto.publicId }
    }

    await ngo.save()

    return res
      .status(200)
      .json(new ApiResponse(200, member, "Member info updated successfully"))
  } catch (error) {
    next(error)
  }
}



const deleteMember = async (req, res, next) => {
  try {
    const user = req.user
    const { memberId } = req.params

    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    if (!memberId) {
      throw new ApiError(400, "Please provide member ID to delete a member")
    }

    const ngo = await Ngo.findOne()
    if (!ngo) {
      throw new ApiError(404, "NGO not found")
    }

    const member = ngo.members.id(memberId)
    if (!member) {
      throw new ApiError(404, "Member not found")
    }

    if (member.photo?.publicId) {
      await cloudinary.uploader.destroy(member.photo.publicId)
    }

    ngo.members.pull(memberId)
    await ngo.save()

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Member deleted successfully"))
  } catch (error) {
    next(error)
  }
}

export {
  getAllUsers,
  deleteUser,
  getMembers,
  uploadNgoDocuments,
  addMemberInfo,
  deleteMember,
  updateMemberInfo,
  
}
