import Certificate from "../Models/certificateModel.js";
import generateCertificate from "../utils/certificateGenerater.js";
import { uploadToCloudinary } from "../utils/cloudConfig.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


const issueCertificate = async (req, res) => {
  try {
    const userId = req.user?._id
    const { name, email, type, eventId } = req.body

    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in to issue certificate"
      })
    }

    
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Name and certificate type are required"
      })
    }

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // --- Check if event date has passed ---
      const today = new Date();
      const eventDate = new Date(event.date);
      if (user.role !== "admin" && eventDate > today) {
      return res.status(400).json({
      success: false,
      message: `Certificates can only be issued after the event has occurred. "${event.title}" is scheduled on ${eventDate.toDateString()}.`,
      })
    }

    
    const certificateBuffer = await generateCertificate({
      name,
      type,
      eventName: event.title,
      issueDate: new Date()
    })

    
    const cloudinaryResult = await uploadToCloudinary(certificateBuffer, `certificate_${name}_${Date.now()}`, "certificates")

    
    const newCertificate = await Certificate.create({
      issuedTo: userId,
      name,
      email,
      type,
      eventId: eventId || null,
      issueDate: new Date(),
      fileUrl: cloudinaryResult?.url || null,
      filePublicId: cloudinaryResult?.publicId || null,
      createdBy: userId,
      status: "issued"
    })

    return res.status(201).json({
      success: true,
      message: "Certificate issued successfully",
      data: newCertificate
    })
  } catch (error) {
    console.error("Error in issueCertificate:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    })
  }
}
const myCertificates = async (req, res) => {
    try {
        const { userId } = req.params
        const user = req.user
        
        if(!userId){
          return res.status(400).json({
            success: false,
            message: "Please provide user ID to fetch Certificates"
          })
        }
        
        if(userId!==String(user._id)){
          return  res.status(403).json({ 
            success: false,
            message: "Forbidden: You can only access your own Certificates" 
        })
        }
        const certificates = await Certificate.find({ issuedTo: userId })
        if (certificates.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No certificates found for this user"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Certificates fetched successfully",
            data: certificates
        })

    } catch (error) {
        console.error("Error in myCertificates:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    })
    }
}

const allCertificates = async (req , res) => {
    try {
        const user = req.user
        if(!user || user.role !== "admin"){
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admins only"
            })
        }
        const certificates =  await Certificate.find()
        if(certificates.length === 0){
            return res.status(404).json({
                success: false,
                message: "No certificates found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Certificates fetched successfully",
            data: certificates
        })   
    } catch (error) {
        console.error("Error in allCertificates:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    })
    }
}

const getSingleCertificate = async (req, res) => {
    try {
        const user = req.user
        const { certificateId } = req.params
        if(!user || user.role !== "admin"){
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admins only"
            })
        }
        if(!certificateId){
            return res.status(400).json({
                success: false,
                message: "Please provide certificate ID to fetch a certificate"
            })
        }
        const certificate = await Certificate.findById(certificateId)
        if(!certificate){
            return res.status(404).json({
                success: false,
                message: "Certificate not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Certificate fetched successfully",
            data: certificate
        })
    } catch (error) {
        console.error("Error in getSingleCertificate:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    })
    }
}
const deleteCertificate = async (req , res) => {
    try {
        const user = req.user
        const { certificateId } = req.params
        if(!user || user.role !== "admin"){
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admins only"
            })
        }
        if(!certificateId){
            return res.status(400).json({
                success: false,
                message: "Please provide certificate ID to delete a certificate"
            })
        }
        const certificate = await Certificate.findById(certificateId)
        if(!certificate){
            return res.status(404).json({
                success: false,
                message: "Certificate not found"
            })
        }
        await Certificate.findByIdAndDelete(certificateId)
        return res.status(200).json({
            success: true,
            message: "Certificate deleted successfully"
        })
    } catch (error) {
        console.error("Error in deleteCertificate:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    })
    }
}
export { issueCertificate , myCertificates , allCertificates , getSingleCertificate , deleteCertificate }