import User from "../Models/userModel.js";
import Donation from "../Models/donationModel.js";

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

export { getAllUsers, deleteUser, getMembers }
