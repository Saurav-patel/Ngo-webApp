import Certificate from "./certificateModel.js"
import Event from "../events/eventModel.js"
import generateCertificate from "../../utils/certificateGenerater.js"
import { uploadToCloudinary, cloudinary } from "../../utils/cloudConfig.js"
import { ApiError } from "../../utils/apiError.js"
import { ApiResponse } from "../../utils/apiResponse.js"
import Ngo from "../ngo/ngoModel.js"
import path from "path"

const issueCertificate = async (req, res, next) => {
  try {
    const user = req.user

    const { name: bodyName, email, type, eventId } = req.body

    const name = user ? user.username : bodyName

    if (!name?.trim()) {
      throw new ApiError(400, "Name is required")
    }

    if (!type) {
      throw new ApiError(400, "Certificate type is required")
    }

    let event = null

    if (type === "EventParticipation") {
      event = await Event.findById(eventId)

      if (!event) {
        throw new ApiError(404, "Event not found")
      }

      if (new Date(event.endDate) > new Date()) {
        throw new ApiError(
          400,
          "Certificates can only be issued after the event ends"
        )
      }

      const existing = await Certificate.findOne({
        issuedTo: user?._id,
        eventId
      })

      if (existing) {
        throw new ApiError(
          400,
          "Certificate already issued for this event"
        )
      }
    }

    const ngo = await Ngo.findOne()

    if (!ngo) {
      throw new ApiError(500, "NGO configuration missing")
    }

    const certificateBuffer = await generateCertificate({
      name,
      ngoName: ngo.name,
      regNo: ngo.registrationNumber,
      presidentName: "Abhishek Kumar",
      logoPath: path.resolve("public/logo.png"),
      signPath: path.resolve("public/signature.png")
    })

    const upload = await uploadToCloudinary(
      certificateBuffer,
      `certificate_${Date.now()}`,
      "certificates"
    )

    const certificate = await Certificate.create({
      issuedTo: user?._id || null,
      name,
      email,
      type,
      eventId: eventId || null,
      fileUrl: upload?.url || null,
      filePublicId: upload?.publicId || null,
      createdBy: user?._id || null,
      status: "ISSUED"
    })

    return res
      .status(201)
      .json(
        new ApiResponse(201, certificate, "Certificate issued successfully")
      )
  } catch (error) {
    next(error)
  }
}

const myCertificates = async (req, res, next) => {
  try {
    const userId = req.user?._id

    const certificates = await Certificate.find({ issuedTo: userId })
      .sort({ createdAt: -1 })
    if (certificates.length === 0) {
      throw new ApiError(404, "No certificates found for this user")
    }
        
    return res
      .status(200)
      .json(new ApiResponse(200, certificates))
  } catch (error) {
    next(error)
  }
}

const allCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find()
      .sort({ createdAt: -1 })

    return res
      .status(200)
      .json(new ApiResponse(200, certificates))
  } catch (error) {
    next(error)
  }
}

const getSingleCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params

    const certificate = await Certificate.findById(certificateId)

    if (!certificate) {
      throw new ApiError(404, "Certificate not found")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, certificate))
  } catch (error) {
    next(error)
  }
}

const deleteCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params

    const certificate = await Certificate.findById(certificateId)

    if (!certificate) {
      throw new ApiError(404, "Certificate not found")
    }

    if (certificate.filePublicId) {
      await cloudinary.uploader.destroy(certificate.filePublicId)
    }

    await certificate.deleteOne()

    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Certificate deleted successfully")
      )
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

