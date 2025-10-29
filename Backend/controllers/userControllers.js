import User from "../Models/userModel.js";
import bcrypt from "bcrypt"
import Donation from "../Models/donationModel.js";
import mongoose from "mongoose";
import { cloudinary, uploadToCloudinary } from "../utils/cloudConfig.js";




const completeProfile = async (req , res) => {
    try {
        const userId = req.params
        const user = req.user
        const {
            
            address,
            city,
            fatherName,
            phone,
            dob,
            aadhaarNumber
        } = req.body
        if(userId !== user._id){
            return res.status(403).json({
                success: false,
                message: "You are not authorized to complete this profile"
            })
        }
        if(!userId){
            return res.status(401).json({
                success: false,
                message: "user is missing , please login again"
            })
        }
        if( !address || !city || !fatherName || !phone || !dob || !aadhaarNumber){
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            })
        }
        const existingUser = await User.findOne({email: email})
        if(!existingUser){
            return res.status(400).json({
                success: false,
                message: "User with this email not found"
            })
        }
        existingUser.address = address
        existingUser.city = city
        existingUser.fatherName = fatherName
        existingUser.phone = phone
        existingUser.dob = dob
        existingUser.aadhaarNumber = aadhaarNumber

        await existingUser.save()
        return res.status(200).json({
            success: true,
            message: "Profile completed successfully",
            data: existingUser
        })
    
        
             
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const uploadProfilePicture = async (req , res) =>{
    try {
        const user = req.user
        const userId = req.user?._id
        const photo = req.file
        if(userId !== user._id){
            return res.status(403).json({
                success: false,
                message: "You are not authorized to upload this user's profile picture"
            })
        }
        if(!userId){
            return res.status(401).json({
                success: false,
                message: "user is missing , please login again"
            })
        }
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return  res.status(400).json({
                success: false,
                message: "Invalid user ID"
            })
        }
        if(!photo){
            return res.status(400).json({
                success: false,
                message: "Please upload a profile picture"
            })
        }
        const uploadedPhoto =  await uploadToCloudinary(photo[0].path , "profile_pictures")
        const fileUrl = {
            url: uploadedPhoto.secure_url,
            publicId: uploadedPhoto.public_id
        }
        const checkUser = await User.findOne({ _id: userId })
        if(!checkUser){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        checkUser.profile_pic_url = fileUrl
        await checkUser.save()
        return res.status(200).json({
            success: true,
            message: "Profile picture uploaded successfully",
            data: checkUser.profile_pic_url
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




const changePassword = async (req, res) => {
    try {
        const user = req.user
        const { userId } = req.params
        const { oldPassword, newPassword } = req.body
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user is missing , please login again"
            })
        }

        if(!mongoose.Types.ObjectId.isValid(userId)){
            return  res.status(400).json({
                success: false,
                message: "Invalid user ID"
            })
        }

        if (userId !== user._id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to change this user's password"
            })
        }
        
        
        const findUser = await User.findById(userId)
        if (!findUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        const isPasswordCorrect = await bcrypt.compare(oldPassword, findUser.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect"
            })
        }
        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be same as old password"
            })
        }
        findUser.password = newPassword
        await findUser.save()
        
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const updateProfilePicture = async (req , res) =>{
    try {
        const user = req.user
        const { userId } = req.params
        const photo = req.file
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user is missing , please login again"
            })
        }
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return  res.status(400).json({
                success: false,
                message: "Invalid user ID"
            })
        }
        if (userId !== user._id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this user's profile picture"
            })
        }
        if(!photo){
            return res.status(400).json({
                success: false,
                message: "Please upload a profile picture"
            })
        }
        const checkUser = await User.findOne({ _id: userId })
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        const previousPublicId = checkUser.profile_pic_url?.publicId
        
        if(previousPublicId){
        await uploadToCloudinary.deleteFromCloudinary(previousPublicId)
        }
        
        const uploadedPhoto =  await uploadToCloudinary(photo[0].path , "profile_pictures")
        
        const fileUrl = {
            url: uploadedPhoto.secure_url,
            publicId: uploadedPhoto.public_id
        }
        
        checkUser.profile_pic_url = fileUrl
        
        await checkUser.save()
        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            data: checkUser.profile_pic_url
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




const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params
        const  user  = req.user
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user is missing , please login again"
            })
        }


        if(!mongoose.Types.ObjectId.isValid(userId)){
            return  res.status(400).json({
                success: false,
                message: "Invalid user ID"
            })
        }
        
        
        
        
        if (userId !== user._id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this user's details"
            })
        }
        
        const getUser = await User.findById(userId)
        if (!getUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            data: {
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

            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
}

const getMembershipStatus = async (req, res) => {
    try {
        const { userId } = req.params
        const  user  = req.user
       
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user is missing , please login again"
            })
        }
        
       if(!mongoose.Types.ObjectId.isValid(userId)){
            return  res.status(400).json({
                success: false,
                message: "Invalid user ID"
            })
        }
       
        
       
       
       
        if (userId !== user._id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this user's details"
            })
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
        return res.status(200).json({
            success: true,
            message: "Membership status fetched successfully",
            data: {
                status: status,
                validity: validity,
                registerNumber: user.registerNumber || null,
                verification: latestDonation ? latestDonation.isVerified : false
            }
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}



export { changePassword, getUserDetails, getMembershipStatus , uploadProfilePicture , updateProfilePicture , completeProfile}