import { createCanvas, loadImage } from "canvas"

const generateIDCard = async ({
  name,
  position,
  profilePicUrl,
  cardNumber,
  expiryDate,
  qrBuffer
}) => {
  const width = 600
  const height = 350
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  // Header
  ctx.fillStyle = "#1a73e8"
  ctx.fillRect(0, 0, width, 60)

  // Profile image
  let profileImg
  try {
    profileImg = await loadImage(profilePicUrl)
  } catch {
    profileImg = await loadImage("https://via.placeholder.com/100")
  }
  ctx.save()
  ctx.beginPath()
  ctx.arc(80, 180, 60, 0, Math.PI * 2, true)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(profileImg, 20, 120, 120, 120)
  ctx.restore()

  // Text
  ctx.fillStyle = "#000"
  ctx.font = "bold 24px Arial"
  ctx.fillText(name, 160, 150)
  ctx.font = "20px Arial"
  ctx.fillText(position, 160, 190)
  ctx.font = "16px Arial"
  ctx.fillText(`Card No: ${cardNumber}`, 160, 230)
  ctx.fillText(`Valid Till: ${expiryDate}`, 160, 260)

  // QR code
  let qrImg
  try {
    qrImg = await loadImage(qrBuffer)
  } catch {
    qrImg = await loadImage("https://via.placeholder.com/130")
  }
  ctx.drawImage(qrImg, width - 150, height - 150, 130, 130)

  // Return PNG buffer
  return canvas.toBuffer("image/png")
}

export default generateIDCard
