import User from "../Models/userModel.js"
import bcrypt from "bcrypt"
import Donation from "../Models/donationModel.js"
import mongoose from "mongoose"
import { uploadToCloudinary } from "../utils/cloudConfig.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import { maskAadhaar } from "../utils/aadharMasker.js"



const completeProfile = async (req , res , next) => {
    try {
        
        const userId = req.user?._id
        const { address, city, fatherName, phone, dob, aadhaarNumber } = req.body
      
       
        if(!userId){
            throw new ApiError(401 , "user is missing , please login again")
        }
        if(!address || !city || !fatherName || !phone || !dob || !aadhaarNumber){
            throw new ApiError(400 , "Please provide all required fields")
        }

        const existingUser = await User.findOne({_id :userId}).select("-password -__v")
        if(!existingUser){
            throw new ApiError(404 , "User not found")
        }

        existingUser.address = address
        existingUser.city = city
        existingUser.fatherName = fatherName
        existingUser.phone = phone
        existingUser.dob = dob
        existingUser.aadhaarNumber = maskAadhaar(aadhaarNumber)

        await existingUser.save()

        return res.status(200).json(new ApiResponse(200 , existingUser , "Profile completed successfully"))
    
    } catch (error) {
        next(error)
    }
}





const changePassword = async (req, res , next) => {
    try {
        const userId = req.user?._id
        
        const { oldPassword, newPassword } = req.body
        
        if (!userId) {
            throw new ApiError(401 , "user is missing , please login again")
        }

        
        const findUser = await User.findById(userId)
        if (!findUser) {
            throw new ApiError(404 , "User not found")
        }

        const isPasswordCorrect = await bcrypt.compare(oldPassword, findUser.password)
        if (!isPasswordCorrect) {
            throw new ApiError(400 , "Old password is incorrect")
        }

        if (oldPassword === newPassword) {
            throw new ApiError(400 , "New password cannot be same as old password")
        }

        findUser.password = newPassword
        await findUser.save()
        
        return res.status(200).json(new ApiResponse(200 , null , "Password changed successfully"))

    } catch (error) {
        next(error)
    }
}



const uploadOrUpdateProfilePicture = async (req, res, next) => {
  try {

    const userId = req.user?._id
    const photo = req.file

    if (!userId) {
      throw new ApiError(401, "User missing, please login again")
    }

    if (!photo) {
      throw new ApiError(400, "Please upload a profile picture")
    }

    const existingUser = await User.findById(userId)
    if (!existingUser) {
      throw new ApiError(404, "User not found")
    }

    // delete old image if exists
    if (existingUser.profile_pic_url?.publicId) {
      await uploadToCloudinary.deleteFromCloudinary(
        existingUser.profile_pic_url.publicId
      )
    }

    const uploadedPhoto = await uploadToCloudinary(
      photo.buffer,
      "profile_pictures"
    )

    existingUser.profile_pic_url = {
      url: uploadedPhoto.url,
      publicId: uploadedPhoto.publicId
    }

    await existingUser.save()

    return res.status(200).json(
      new ApiResponse(
        200,
        existingUser.profile_pic_url.url,
        "Profile picture updated successfully"
      )
    )
  } catch (error) {
    next(error)
  }
}

const updateProfile = async (req, res, next) => {
  try {

    const userId = req.user?._id

    if (!userId) {
      throw new ApiError(401, "User missing, please login again")
    }

   

    const existingUser = await User.findById(userId).select("-password -__v")
    if (!existingUser) {
      throw new ApiError(404, "User not found")
    }

    const {
      address,
      city,
      fatherName,
      phone,
      dob
    } = req.body

    const updates = { address, city, fatherName, phone, dob }

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        existingUser[key] = updates[key]
      }
    })

    await existingUser.save()

    return res.status(200).json(
      new ApiResponse(200, existingUser, "Profile updated successfully")
    )
  } catch (error) {
    next(error)
  }
}




const getUserDetails = async (req, res , next) => {
    try {
        
        const  user  = req.user
        
        if (!user._id) {
            throw new ApiError(401 , "user is missing , please login again")
        }

        if(!mongoose.Types.ObjectId.isValid(user._id)){
            throw new ApiError(400 , "Invalid user ID")
        }

        

        const getUser = await User.findById(user._id).select("-password -__v")
        if (!getUser) {
            throw new ApiError(404 , "User not found")
        }

        return res.status(200).json(new ApiResponse(200 , {
            id: getUser._id,
            email: getUser.email,
            username: getUser.username,
            fatherName: getUser.fatherName,
            designation: getUser.designation,
            address: getUser.address,
            aadhaarNumber: getUser.aadhaarNumber,
            phone: getUser.phone,
            dob: getUser.dob,
            status: getUser.status,
            city: getUser.city,
            profile_pic_url: getUser.profile_pic_url.url || null,
            registerNumber: getUser.registerNumber,
            validity: getUser.validity
        }, "User details fetched successfully"))

    } catch (error) {
        next(error)
    }
}



const getMembershipStatus = async (req, res, next) => {
  try {
    const userId = req.user._id

    const latestDonation = await Donation
      .findOne({ donor: userId })
      .sort({ date: -1 })

    let status = "Inactive"
    let validity = null
    let verification = false

    if (latestDonation && latestDonation.isVerified) {
      verification = true
      const donationDate = new Date(latestDonation.date)
      validity = new Date(donationDate.setFullYear(donationDate.getFullYear() + 1))

      if (validity > new Date()) {
        status = "Active"
      }
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          status,
          validity,
          registerNumber: req.user.registerNumber || null,
          verification
        },
        "Membership status fetched successfully"
      )
    )
  } catch (error) {
    next(error)
  }
}


export { changePassword, getUserDetails, getMembershipStatus , uploadOrUpdateProfilePicture , completeProfile ,updateProfile}
