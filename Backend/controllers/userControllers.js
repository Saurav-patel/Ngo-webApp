import User from "../Models/userModel.js";
import bcrypt from "bcrypt"
import Donation from "../Models/donationModel.js";

const changePassword = async (req, res) => {
    try {
        const user = req.user
        const { userId } = req.params
        if (userId !== user._id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to change this user's password"
            })
        }
        const { oldPassword, newPassword } = req.body


        if (!user) {
            return res.status(401).json({
                success: false,
                message: "user is missing , please login again"
            })
        }
        const findUser = await User.findById(user._id)
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
        await findUser.updateOne({ password: newPassword })
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

const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params
        const { user } = req.user
        if (userId !== user._id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this user's details"
            })
        }
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "user is missing , please login again"
            })
        }
        const getUser = await User.findById(user._id)
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
        const { user } = req.user
        if (userId !== user._id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this user's details"
            })
        }
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "user is missing , please login again"
            })
        }
        const latestDonation = await Donation.findOne({ donor: user._id }).sort({ date: -1 })
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

                await User.findByIdAndUpdate(user._id, { registerNumber: registerNumber })
            }
        }

        await User.findByIdAndUpdate(user._id, { status: status, validity: validity })
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

export { changePassword, getUserDetails, getMembershipStatus }