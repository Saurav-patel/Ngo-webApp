import Certificate from "../Models/certificateModel.js"
import Event from "../Models/eventModel.js"
import generateCertificate from "../utils/certificateGenerater.js"
import { uploadToCloudinary } from "../utils/cloudConfig.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const issueCertificate = async (req, res, next) => {
  try {
    const user = req.user
    const userId = user?._id
    const { name, email, type, eventId } = req.body

    if (!userId) {
      throw new ApiError(401, "Unauthorized: Please log in to issue certificate")
    }

    if (!name || !type) {
      throw new ApiError(400, "Name and certificate type are required")
    }

    const event = await Event.findById(eventId)
    if (!event) {
      throw new ApiError(404, "Event not found")
    }

    const today = new Date()
    const eventDate = new Date(event.date)

    if (user.role !== "admin" && eventDate > today) {
      throw new ApiError(
        400,
        `Certificates can only be issued after the event has occurred. "${event.title}" is scheduled on ${eventDate.toDateString()}.`
      )
    }

    const certificateBuffer = await generateCertificate({
      name,
      type,
      eventName: event.title,
      issueDate: new Date()
    })

    const cloudinaryResult = await uploadToCloudinary(
      certificateBuffer,
      `certificate_${name}_${Date.now()}`,
      "certificates"
    )

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

    return res
      .status(201)
      .json(new ApiResponse(201, newCertificate, "Certificate issued successfully"))
  } catch (error) {
    next(error)
  }
}

const myCertificates = async (req, res, next) => {
  try {
    const { userId } = req.params
    const user = req.user

    if (!userId) {
      throw new ApiError(400, "Please provide user ID to fetch Certificates")
    }

    if (userId !== String(user._id)) {
      throw new ApiError(403, "Forbidden: You can only access your own Certificates")
    }

    const certificates = await Certificate.find({ issuedTo: userId })
    if (certificates.length === 0) {
      throw new ApiError(404, "No certificates found for this user")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, certificates, "Certificates fetched successfully"))
  } catch (error) {
    next(error)
  }
}

const allCertificates = async (req, res, next) => {
  try {
    const user = req.user

    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    const certificates = await Certificate.find()
    if (certificates.length === 0) {
      throw new ApiError(404, "No certificates found")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, certificates, "Certificates fetched successfully"))
  } catch (error) {
    next(error)
  }
}

const getSingleCertificate = async (req, res, next) => {
  try {
    const user = req.user
    const { certificateId } = req.params

    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    if (!certificateId) {
      throw new ApiError(400, "Please provide certificate ID to fetch a certificate")
    }

    const certificate = await Certificate.findById(certificateId)
    if (!certificate) {
      throw new ApiError(404, "Certificate not found")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, certificate, "Certificate fetched successfully"))
  } catch (error) {
    next(error)
  }
}

const deleteCertificate = async (req, res, next) => {
  try {
    const user = req.user
    const { certificateId } = req.params

    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admins only")
    }

    if (!certificateId) {
      throw new ApiError(400, "Please provide certificate ID to delete a certificate")
    }

    const certificate = await Certificate.findById(certificateId)
    if (!certificate) {
      throw new ApiError(404, "Certificate not found")
    }

    await Certificate.findByIdAndDelete(certificateId)

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Certificate deleted successfully"))
  } catch (error) {
    next(error)
  }
}

export {
  issueCertificate,
  myCertificates,
  allCertificates,
  getSingleCertificate,
  deleteCertificate
}
