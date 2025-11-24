import { createCanvas, loadImage } from "canvas"
import fs from "fs"
import path from "path"

const generateIDCard = async ({
  ngo = {},
  name = "Name Here",
  position = "Member",
  profilePicUrl,
  cardNumber = "N/A",
  expiryDate = "N/A",
  qrBuffer,
  phone = "N/A",
  address = ""
}) => {
  const width = 650
  const height = 400
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // --------- Theme ---------
  const theme = {
    primary: ngo.themeColor || "#1a73e8",
    gradientStart: "#e8f0fe",
    gradientEnd: "#ffffff"
  }

  // --------- Background ---------
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, theme.gradientStart)
  gradient.addColorStop(1, theme.gradientEnd)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // --------- Border ---------
  ctx.strokeStyle = theme.primary
  ctx.lineWidth = 6
  ctx.strokeRect(3, 3, width - 6, height - 6)

  // --------- Header ---------
  ctx.fillStyle = theme.primary
  ctx.fillRect(0, 0, width, 70)

  // --------- NGO Logo ---------
  let logo
  try {
    if (ngo.logoUrl && ngo.logoUrl.startsWith("http")) {
      logo = await loadImage(ngo.logoUrl)
    } else if (ngo.logoUrl && fs.existsSync(ngo.logoUrl)) {
      logo = await loadImage(ngo.logoUrl)
    } else {
      const fallbackLogo = path.resolve("public/logo.png")
      logo = await loadImage(fallbackLogo)
    }
  } catch {
    const fallbackLogo = path.resolve("public/logo.png")
    logo = await loadImage(fallbackLogo)
  }
  ctx.drawImage(logo, 20, 10, 50, 50)

  // --------- NGO Name + Reg ---------
  ctx.fillStyle = "#fff"
  ctx.font = "bold 26px Sans-serif"
  ctx.fillText(ngo.name || "NGO NAME", 80, 35)
  ctx.font = "16px Sans-serif"
  ctx.fillText(`Reg. No: ${ngo.registrationNumber || "N/A"}`, 80, 58)

  // --------- Profile Picture ---------
  let profile
  try {
    if (profilePicUrl && profilePicUrl.startsWith("http")) {
      profile = await loadImage(profilePicUrl)
    } else if (profilePicUrl && fs.existsSync(profilePicUrl)) {
      profile = await loadImage(profilePicUrl)
    } else {
      const fallbackProfile = path.resolve("public/default-avatar.jpg")
      profile = await loadImage(fallbackProfile)
    }
  } catch {
    const fallbackProfile = path.resolve("public/default-avatar.jpg")
    profile = await loadImage(fallbackProfile)
  }

  ctx.save()
  ctx.beginPath()
  ctx.arc(100, 200, 70, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(profile, 30, 130, 140, 140)
  ctx.restore()

  // --------- Text wrapping helper (used for cardholder + NGO address) ---------
  const wrapText = (text, x, y, maxWidth, lineHeight) => {
    const words = text.split(" ")
    let line = ""
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " "
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y)
        line = words[n] + " "
        y += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, y)
  }

  // --------- User Info (Cardholder) ---------
  ctx.fillStyle = "#000"
  ctx.font = "bold 24px Sans-serif"
  ctx.fillText(name, 200, 160)

  ctx.font = "20px Sans-serif"
  ctx.fillStyle = "#333"
  ctx.fillText(position, 200, 190)

  ctx.font = "16px Sans-serif"
  ctx.fillText(`Card No: ${cardNumber}`, 200, 220)
  ctx.fillText(`Valid Till: ${expiryDate}`, 200, 245)

  if (phone) {
    ctx.fillText(`Phone: ${phone}`, 200, 270)
  }

  if (address) {
    const cardholderAddress = address
    const addrX = 200
    const addrY = 295
    const addrMaxWidth = width - 220
    const addrLineHeight = 18
    wrapText(cardholderAddress, addrX, addrY, addrMaxWidth, addrLineHeight)
  }

  // --------- QR Code ---------
  try {
    const qrDataUrl = `data:image/png;base64,${qrBuffer.toString("base64")}`
    const qrImg = await loadImage(qrDataUrl)
    ctx.drawImage(qrImg, width - 150, height - 170, 120, 120)
  } catch {
    const fallbackQR = path.resolve("public/fallback-qr.jpg")
    const qrImg = await loadImage(fallbackQR)
    ctx.drawImage(qrImg, width - 150, height - 170, 120, 120)
  }

  // --------- Footer (NGO Address) ---------
  ctx.fillStyle = theme.primary
  ctx.fillRect(0, height - 60, width, 60)
  ctx.fillStyle = "#fff"
  ctx.font = "16px Sans-serif"

  const ngoAddress = ngo.address || "Address not available"
  wrapText(ngoAddress, 20, height - 35, width - 40, 18)

  // --------- Output ---------
  return canvas.toBuffer("image/png")
}

export default generateIDCard
