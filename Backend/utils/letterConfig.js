import { createCanvas, loadImage } from "canvas"

/**
 * Generates a placeholder appointment letter image.
 * 
 * @param {Object} options
 * @param {String} options.logoUrl - NGO or organization logo
 * @param {String} options.signUrl - President/Head signature image
 * @param {String} options.recipientName - Person’s name (Visitor or Member)
 * @param {String} options.ngoName - NGO name
 * @returns {Buffer} PNG buffer of appointment letter
 */
const generateAppointmentLetter = async ({
  logoUrl = "https://via.placeholder.com/100",
  signUrl = "https://via.placeholder.com/100",
  recipientName = "Recipient Name",
  ngoName = "Organization Name",
}) => {
  const width = 800
  const height = 1000
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  // Header Bar
  ctx.fillStyle = "#1a73e8"
  ctx.fillRect(0, 0, width, 80)

  // Logo
  try {
    const logo = await loadImage(logoUrl)
    ctx.drawImage(logo, 40, 15, 60, 60)
  } catch {
    // Ignore image load failure
  }

  // NGO Name
  ctx.fillStyle = "#fff"
  ctx.font = "bold 30px Sans-serif"
  ctx.fillText(ngoName, 120, 55)

  // Title: Appointment Letter
  ctx.fillStyle = "#000"
  ctx.font = "bold 32px Sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("APPOINTMENT LETTER", width / 2, 180)

  // Recipient Placeholder
  ctx.font = "22px Sans-serif"
  ctx.textAlign = "center"
  ctx.fillText(`Issued to: ${recipientName}`, width / 2, 250)

  // Placeholder Rectangle (for future body)
  ctx.strokeStyle = "#999"
  ctx.lineWidth = 2
  ctx.strokeRect(80, 300, width - 160, 500)
  ctx.font = "18px Sans-serif"
  ctx.fillStyle = "#888"
  ctx.textAlign = "center"
  ctx.fillText("Body content will be added here later", width / 2, 550)

  // Signature
  try {
    const sign = await loadImage(signUrl)
    ctx.drawImage(sign, width - 250, height - 180, 150, 60)
  } catch {
    // Ignore
  }

  // Footer Text
  ctx.fillStyle = "#000"
  ctx.font = "16px Sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("Authorized Signature", width - 180, height - 100)

  return canvas.toBuffer("image/png")
}

export default generateAppointmentLetter
