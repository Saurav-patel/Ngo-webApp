import User from "../Models/userModel.js"
import Donation from "../Models/donationModel.js"
import mongoose from "mongoose"
import { uploadToCloudinary, cloudinary } from "../utils/cloudConfig.js"
import Document from "../Models/documentModel.js"
import Ngo from "../Models/ngoModel.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import {Participation} from "../Models/participationModel.js"
import Certificate from "../Models/certificateModel.js"

const getAllUsers = async (req, res, next) => {
  try {
    const admin = req.user
    console.log(admin);
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

const addUserByAdmin = async (req, res, next) => {
  try {
    const admin = req.user
    const { username, email, phone, address, city, dob, password } = req.body
    const file = req.file

    if (!admin || admin.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    if (!username || !email || !password) {
      throw new ApiError(400, "Username, email and password are required")
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new ApiError(400, "User with this email already exists")
    }

    let dobDate
    if (dob) {
      dobDate = new Date(dob)
      if (isNaN(dobDate)) {
        throw new ApiError(400, "Invalid DOB format")
      }
    }

    let profilePic = null
    if (file) {
      const uploadedPhoto = await uploadToCloudinary(file.buffer, "profile_pictures")
      profilePic = {
        url: uploadedPhoto.url,
        publicId: uploadedPhoto.publicId
      }
    }

    const newUser = await User.create({
      username,
      email,
      password,          // generic password
      phone,
      address,
      city,
      dob: dobDate,
      role: "user",
      isActive: true,
      profile_pic_url: profilePic
    })

    return res.status(201).json(
      new ApiResponse(201, {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }, "User added successfully")
    )
  } catch (error) {
    next(error)
  }
}


const updateUserByAdmin = async (req, res, next) => {
  try {
    const admin = req.user
    const { userId } = req.params
    const { username, email, phone, address, city, dob, isActive } = req.body
    const file = req.file

    if (!admin || admin.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    if (!userId) {
      throw new ApiError(400, "User ID is required")
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new ApiError(404, "User not found")
    }

    if (username) user.username = username
    if (email) user.email = email
    if (phone) user.phone = phone
    if (address) user.address = address
    if (city) user.city = city
    if (typeof isActive === "boolean") user.isActive = isActive

    if (dob) {
      const dobDate = new Date(dob)
      if (isNaN(dobDate)) {
        throw new ApiError(400, "Invalid DOB format")
      }
      user.dob = dobDate
    }

    if (file) {
      if (user.profile_pic_url?.publicId) {
        await uploadToCloudinary.deleteFromCloudinary(
          user.profile_pic_url.publicId
        )
      }

      const uploadedPhoto = await uploadToCloudinary(file.buffer, "profile_pictures")
      user.profile_pic_url = {
        url: uploadedPhoto.url,
        publicId: uploadedPhoto.publicId
      }
    }

    await user.save()

    return res.status(200).json(
      new ApiResponse(200, user, "User updated successfully")
    )
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

const getSingleUser = async (req, res, next) => {
  try {
    const { userId } = req.params
    const admin = req.user

    if (!admin || admin.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    if (!userId) {
      throw new ApiError(400, "User ID is required")
    }

    const user = await User.findById(userId).select("-password -__v")
    if (!user) {
      throw new ApiError(404, "User not found")
    }

    // ✅ COUNTS ONLY (FAST & CLEAN)
    const [participationsCount, certificatesCount] = await Promise.all([
      Participation.countDocuments({ userId: userId }),
      Certificate.countDocuments({ issuedTo: userId })
    ])

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user,
          stats: {
            participationsCount,
            certificatesCount
          }
        },
        "User details fetched successfully"
      )
    )
  } catch (error) {
    next(error)
  }
}


export {
  getAllUsers,
  deleteUser,
  getMembers,
  uploadNgoDocuments,
  addUserByAdmin,
  deleteMember,
  getSingleUser,
  updateUserByAdmin,
  
}
