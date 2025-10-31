import mongoose from "mongoose";
import AppointmentLetter from "../Models/appointmentLetterModel.js";
import Visitor from "../Models/visitorModel.js";

const applyAppointmentLetter = async (req, res) => {
  try {
    const userId = req.user?._id
    const userName = req.user?.name || "User"

    // --- Authorization check ---
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in to apply for appointment letter"
      })
    }

    // --- Validate ID format ---
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      })
    }

    // --- Check for existing ungenerated letter ---
    const existingLetter = await AppointmentLetter.findOne({
      issuedTo: userId,
      generated: false
    })

    if (existingLetter) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending appointment letter request"
      })
    }

    // --- Create new letter request ---
    const letterContent = `This is a placeholder for ${userName}'s appointment letter. 
The final letter content will be updated once approved by the admin.`

    const newLetter = await AppointmentLetter.create({
      issuedTo: userId,
      createdBy: userId, // later can change to admin ID when issued
      generated: false,
      content: letterContent
    })

    return res.status(201).json({
      success: true,
      message: "Appointment letter application submitted successfully",
      data: newLetter
    })
  } catch (error) {
    console.error("Error in applyAppointmentLetter:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    })
  }
}

const generateAppointmentLetter = async (req, res) => {
  try {
    const userId = req.user?._id
    const userName = req.user?.name || "User"

    // --- Check auth ---
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in"
      })
    }

    // --- Validate user ID ---
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      })
    }

    // --- Fetch ungenerated appointment letter ---
    const letter = await AppointmentLetter.findOne({
      issuedTo: userId,
      generated: false
    })
    if (!letter) {
      return res.status(404).json({
        success: false,
        message: "No pending appointment letter request found"
      })
    }

    // --- Get logo and sign URLs from Document collection ---
    const logoDoc = await Document.findOne({ title: /logo/i })
    const signDoc = await Document.findOne({ title: /sign/i })

    const logoUrl = logoDoc?.fileUrl?.[0]?.url || "https://via.placeholder.com/100"
    const signUrl = signDoc?.fileUrl?.[0]?.url || "https://via.placeholder.com/100"

    // --- Generate appointment letter image ---
    const imageBuffer = await generateAppointmentLetter({
      logoUrl,
      signUrl,
      recipientName: userName,
      ngoName: "Your NGO Name" // later replace with dynamic NGO name
    })

    // --- Upload to Cloudinary ---
    const uploadResponse = await uploadToCloudinary(imageBuffer, `appointment_letter_${userId}`, "appointment_letters")

    // --- Update letter record ---
    letter.generated = true
    letter.fileUrl = uploadResponse.secure_url
    letter.filePublicId = uploadResponse.public_id
    await letter.save()

    return res.status(200).json({
      success: true,
      message: "Appointment letter generated successfully",
      data: {
        id: letter._id,
        issuedTo: userName,
        fileUrl: uploadResponse.secure_url
      }
    })

  } catch (error) {
    console.error("Error generating appointment letter:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    })
  }
}

const getPendingAndGeneratedAppointmentLetter = async (req, res) => {
  try {
    const adminId = req.user?._id
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: To view appointment letters"
      })
    }

    
    const letters = await AppointmentLetter.find()
      .populate('issuedTo', 'username email')
      .sort({ createdAt: -1 });

    if(!letters || letters.length === 0){
      return res.status(200).json({
        success: true,
        message: "No appointment letters found",
        data: {
          pendingLetters: [],
            generatedLetters: []
        }
      })
    }
    const pendingLetters = letters.filter(l => !l.generated);
    const generatedLetters = letters.filter(l => l.generated);

    return res.status(200).json({
      success: true,
      message: "Appointment letters fetched successfully",
      data: {
        pendingLetters,
        generatedLetters
      }
    })

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    })
  }
}

const visitorLetter = async (req , res) => {
    try {
        const { email ,phone , name , address} = req.body
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide email to apply for appointment letter"
            })
        }
        const existingVisitor = await Visitor.findOne({email})
        if (existingVisitor) {
            await AppointmentLetter.create({
                issuedTo: existingVisitor._id,
                createdBy: existingVisitor._id,
                generated: false,
                content: "This is your appointment letter. The final content will be updated soon."
            })
        }

        const visitor = await Visitor.create({
            name,
            email: email.toLowerCase(),
            phone,
            address,
        })
        await AppointmentLetter.create({
            issuedTo: visitor._id,
            createdBy: visitor._id,
            generated: false,
            content: "This is your appointment letter. The final content will be updated soon."
        })

        return res.status(200).json({
            success: true,
            message: "Appointment letter application submitted successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

const myLetters = async(req , res) => {
    try {
        const {userId} = req.params
        if(!userId){
            return res.status(400).json({
                success: false,
                message: "Please provide user ID to fetch appointment letters"
            })
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            })
        }

        const letter = await AppointmentLetter.find({ issuedTo: userId }).sort({ createdAt: -1 })
        if(!letter || letter.length === 0){
            return res.status(200).json({
                success: true,
                message: "No appointment letters found",
                data: []
            })
        }
        return res.status(200).json({
            success: true,
            message: "Appointment letters fetched successfully",
            data: letter
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}
export { getPendingAndGeneratedAppointmentLetter , applyAppointmentLetter ,generateAppointmentLetter, visitorLetter , myLetters }