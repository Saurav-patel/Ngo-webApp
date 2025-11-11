import QRCode from "qrcode"

/**
 * Generates a QR code as a PNG buffer
 * @param {String} data - data to encode in QR
 * @param {Number} size - optional, size of QR in pixels
 * @returns {Buffer} - PNG buffer of QR code
 */
const generateQR = async (data, size = 150) => {
  try {
    const buffer = await QRCode.toBuffer(data, {
      type: "png",
      width: size,
      errorCorrectionLevel: "H",
      margin: 2
    })
    return buffer
  } catch (error) {
    console.error("QR generation error:", error)
    throw new Error("Failed to generate QR code")
  }
}

export default generateQR
