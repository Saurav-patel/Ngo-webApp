import dotenv from "dotenv"
dotenv.config()

import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} filename - Base filename (optional)
 * @param {String} folder - Folder name (optional)
 * @returns {Object} - { url, publicId }
 */
const uploadToCloudinary = async (fileBuffer, filename = "file", folder = "general") => {
  return new Promise((resolve, reject) => {
    const publicId = `${filename}-${Date.now()}`
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId },
      (error, result) => {
        if (error) reject(error)
        else resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    stream.end(fileBuffer)
  })
}

export { cloudinary, uploadToCloudinary }
