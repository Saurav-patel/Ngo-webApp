import mongoose from "mongoose";
import AppointmentLetter from "../Models/appointmentLetterModel.js";
import Visitor from "../Models/visitorModel.js";

const applyAppointmentLetter = async (req, res) => {
  try {
    const userId = req.user?._id
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not logged in"
      })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      })
    }

    
    const existing = await AppointmentLetter.findOne({ issuedTo: userId, generated: false })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending appointment letter request."
      })
    }

    const newApplication = await AppointmentLetter.create({
      issuedTo: userId,
      createdBy: userId,
      generated: false,
      content: "This is your appointment letter. The final content will be updated soon."
    })

    return res.status(201).json({
      success: true,
      message: "Appointment letter application submitted successfully",
      data: newApplication
    })

  } catch (error) {
    console.error(error);
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
        const userId = req.params
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
export { getPendingAndGeneratedAppointmentLetter , applyAppointmentLetter , visitorLetter , myLetters }