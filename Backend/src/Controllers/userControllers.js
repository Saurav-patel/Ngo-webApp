import User from "../Models/userModel.js"
import bcrypt from "bcrypt"
import Donation from "../Models/donationModel.js"
import mongoose from "mongoose"
import { uploadToCloudinary } from "../utils/cloudConfig.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"



const completeProfile = async (req , res , next) => {
    try {
        const {userId} = req.params
        const user = req.user
        const { address, city, fatherName, phone, dob, aadhaarNumber } = req.body
      
        if(userId !== user._id.toString()){
            throw new ApiError(403 , "You are not authorized to complete this profile")
        }
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
        existingUser.aadhaarNumber = aadhaarNumber

        await existingUser.save()

        return res.status(200).json(new ApiResponse(200 , existingUser , "Profile completed successfully"))
    
    } catch (error) {
        next(error)
    }
}



const uploadProfilePicture = async (req , res , next) =>{
    try {
        const user = req.user
        const {userId} = req.params
        const photo = req.file
        
        if(userId !== user._id.toString()){
            throw new ApiError(403 , "You are not authorized to upload this user's profile picture")
        }
        if(!userId){
            throw new ApiError(401 , "user is missing , please login again")
        }
        if(!mongoose.Types.ObjectId.isValid(userId)){
            throw new ApiError(400 , "Invalid user ID")
        }
        if(!photo){
            throw new ApiError(400 , "Please upload a profile picture")
        }

        const checkUser = await User.findOne({ _id: userId })
        if(!checkUser){
            throw new ApiError(404 , "User not found")
        }
        if(checkUser.profile_pic_url?.publicId){
            throw new ApiError(400 , "Profile picture already exists. Please use update endpoint to change it.")
        }

        const uploadedPhoto =  await uploadToCloudinary(photo.buffer , "profile_pictures")
        
        const fileUrl = {
            url: uploadedPhoto.url,
            publicId: uploadedPhoto.publicId
        }
        
        checkUser.profile_pic_url = fileUrl
        await checkUser.save()

        return res.status(200).json(new ApiResponse(200 , checkUser.profile_pic_url.url , "Profile picture uploaded successfully"))

    } catch (error) {
        next(error)
    }
}



const changePassword = async (req, res , next) => {
    try {
        const user = req.user
        const { userId } = req.params
        const { oldPassword, newPassword } = req.body
        
        if (!userId) {
            throw new ApiError(401 , "user is missing , please login again")
        }

        if(!mongoose.Types.ObjectId.isValid(userId)){
            throw new ApiError(400 , "Invalid user ID")
        }

        if (userId !== user._id.toString()) {
            throw new ApiError(403 , "You are not authorized to change this user's password")
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



const updateProfilePicture = async (req , res , next) =>{
    try {
        const user = req.user
        const { userId } = req.params
        const photo = req.file

        if (!userId) {
            throw new ApiError(401 , "user is missing , please login again")
        }
        if(!mongoose.Types.ObjectId.isValid(userId)){
            throw new ApiError(400 , "Invalid user ID")
        }
        if (userId !== user._id.toString()) {
            throw new ApiError(403 , "You are not authorized to update this user's profile picture")
        }
        if(!photo){
            throw new ApiError(400 , "Please upload a profile picture")
        }

        const checkUser = await User.findOne({ _id: userId })
        if(!checkUser){
            throw new ApiError(404 , "User not found")
        }

        const previousPublicId = checkUser.profile_pic_url?.publicId
        if(previousPublicId){
            await uploadToCloudinary.deleteFromCloudinary(previousPublicId)
        }

        const uploadedPhoto =  await uploadToCloudinary(photo.buffer , "profile_pictures")
        
        const fileUrl = {
            url: uploadedPhoto.url,
            publicId: uploadedPhoto.publicId
        }
        
        checkUser.profile_pic_url = fileUrl
        await checkUser.save()

        return res.status(200).json(new ApiResponse(200 , checkUser.profile_pic_url.url , "Profile picture updated successfully"))

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



const getMembershipStatus = async (req, res , next) => {
    try {
        const { userId } = req.params
        const  user  = req.user
       
        if (!userId) {
            throw new ApiError(401 , "user is missing , please login again")
        }
        
        if(!mongoose.Types.ObjectId.isValid(userId)){
            throw new ApiError(400 , "Invalid user ID")
        }

        if (userId !== user._id.toString()) {
            throw new ApiError(403 , "You are not authorized to access this user's details")
        }
        
        const latestDonation = await Donation.findOne({ donor: userId }).sort({ date: -1 })
        let status = "Inactive"
        let validity = null

        if (latestDonation && latestDonation.isVerified) {
            const donationDate = new Date(latestDonation.date)
            const currentDate = new Date()
            const diffInTime = currentDate.getTime() - donationDate.getTime()
            const diffInDays = diffInTime / (1000 * 3600 * 24)

            if (diffInDays <= 365) {
                status = "Active"
                validity = new Date(donationDate.setFullYear(donationDate.getFullYear() + 1))
            }

            if (!user.registerNumber) {
                const totalMembers = await User.countDocuments({ registerNumber: { $exists: true } })
                const registerNumber = `MEM${(totalMembers + 1).toString().padStart(4, "0")}`
                await User.findByIdAndUpdate(userId, { registerNumber: registerNumber })
            }
        }

        await User.findByIdAndUpdate(userId, { status: status, validity: validity })

        return res.status(200).json(new ApiResponse(200 , {
            status: status,
            validity: validity,
            registerNumber: user.registerNumber || null,
            verification: latestDonation ? latestDonation.isVerified : false
        }, "Membership status fetched successfully"))

    } catch (error) {
        next(error)
    }
}



export { changePassword, getUserDetails, getMembershipStatus , uploadProfilePicture , updateProfilePicture , completeProfile }
