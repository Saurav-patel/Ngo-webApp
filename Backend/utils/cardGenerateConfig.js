import { createCanvas, loadImage } from "canvas"

const generateIDCard = async ({
  name,
  position,
  profilePicUrl,
  cardNumber,
  expiryDate,
  qrBuffer,
  ngoDetails, // { name, registrationNo, address, logoUrl }
}) => {
  const width = 650
  const height = 400
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Background
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, "#e8f0fe")
  gradient.addColorStop(1, "#ffffff")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Outer border
  ctx.strokeStyle = "#1a73e8"
  ctx.lineWidth = 6
  ctx.strokeRect(3, 3, width - 6, height - 6)

  // Header Bar
  ctx.fillStyle = "#1a73e8"
  ctx.fillRect(0, 0, width, 70)

  // NGO Logo
  try {
    const logoImg = await loadImage(ngoDetails.logoUrl)
    ctx.drawImage(logoImg, 20, 10, 50, 50)
  } catch {
    // fallback logo
    const placeholder = await loadImage("https://via.placeholder.com/50")
    ctx.drawImage(placeholder, 20, 10, 50, 50)
  }

  // NGO Name
  ctx.fillStyle = "#fff"
  ctx.font = "bold 26px Arial"
  ctx.fillText(ngoDetails.name || "NGO NAME", 80, 35)
  ctx.font = "16px Arial"
  ctx.fillText(`Reg. No: ${ngoDetails.registrationNo || "N/A"}`, 80, 58)

  // Profile Picture
  let profileImg
  try {
    profileImg = await loadImage(profilePicUrl)
  } catch {
    profileImg = await loadImage("https://via.placeholder.com/120")
  }
  ctx.save()
  ctx.beginPath()
  ctx.arc(100, 200, 70, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(profileImg, 30, 130, 140, 140)
  ctx.restore()

  // Text Info
  ctx.fillStyle = "#000"
  ctx.font = "bold 24px Arial"
  ctx.fillText(name || "Name Here", 200, 170)
  ctx.font = "20px Arial"
  ctx.fillStyle = "#333"
  ctx.fillText(position || "Position", 200, 205)
  ctx.font = "16px Arial"
  ctx.fillText(`Card No: ${cardNumber || "N/A"}`, 200, 240)
  ctx.fillText(`Valid Till: ${expiryDate || "N/A"}`, 200, 265)

  // QR Code
  let qrImg
  try {
    qrImg = await loadImage(qrBuffer)
  } catch {
    qrImg = await loadImage("https://via.placeholder.com/120")
  }
  ctx.drawImage(qrImg, width - 150, height - 170, 120, 120)

  // Footer (NGO address)
  ctx.fillStyle = "#1a73e8"
  ctx.fillRect(0, height - 50, width, 50)
  ctx.fillStyle = "#fff"
  ctx.font = "16px Arial"
  ctx.fillText(ngoDetails.address || "Address not available", 20, height - 20)

  return canvas.toBuffer("image/png")
}

export default generateIDCard
