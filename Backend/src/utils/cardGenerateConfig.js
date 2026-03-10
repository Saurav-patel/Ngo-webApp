import { createCanvas, loadImage } from "canvas"
import path from "path"

const generateIDCard = async ({
  ngo = {},
  name = "Name Here",
  position = "Member",
  profilePicUrl,
  cardNumber = "N/A",
  expiryDate = "N/A",
  phone = "N/A",
  address = ""
}) => {

  const CARD_WIDTH = 650
  const CARD_HEIGHT = 400

  const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT)
  const ctx = canvas.getContext("2d")

  const theme = {
    primary: ngo.themeColor || "#1a73e8",
    gradientStart: "#f4f8ff",
    gradientEnd: "#ffffff"
  }

  /* ---------------- Background ---------------- */

  const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT)
  gradient.addColorStop(0, theme.gradientStart)
  gradient.addColorStop(1, theme.gradientEnd)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  /* ---------------- Border ---------------- */

  ctx.strokeStyle = theme.primary
  ctx.lineWidth = 6
  ctx.strokeRect(3, 3, CARD_WIDTH - 6, CARD_HEIGHT - 6)

  /* ---------------- Header ---------------- */

  ctx.fillStyle = theme.primary
  ctx.fillRect(0, 0, CARD_WIDTH, 70)

  /* ---------------- NGO Logo ---------------- */

  let logo
  try {
    if (ngo.logoUrl?.startsWith("http")) {
      logo = await loadImage(ngo.logoUrl)
    } else {
      logo = await loadImage(path.resolve("public/logo.png"))
    }
  } catch {
    logo = await loadImage(path.resolve("public/logo.png"))
  }

  ctx.drawImage(logo, 20, 10, 50, 50)

  /* ---------------- NGO Name ---------------- */

  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 26px Sans-serif"
  ctx.fillText(ngo.name || "NGO NAME", 80, 35)

  ctx.font = "16px Sans-serif"
  ctx.fillText(`Reg No: ${ngo.registrationNumber || "N/A"}`, 80, 58)

  /* ---------------- Profile Picture ---------------- */

  let profile
  try {
    if (profilePicUrl?.startsWith("http")) {
      profile = await loadImage(profilePicUrl)
    } else {
      profile = await loadImage(path.resolve("public/default-avatar.jpg"))
    }
  } catch {
    profile = await loadImage(path.resolve("public/default-avatar.jpg"))
  }

  ctx.save()
  ctx.beginPath()
  ctx.arc(110, 200, 70, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  ctx.drawImage(profile, 40, 130, 140, 140)

  ctx.restore()

  /* ---------------- Text Wrapper ---------------- */

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

  /* ---------------- Member Info ---------------- */

  ctx.fillStyle = "#000"
  ctx.font = "bold 26px Sans-serif"
  ctx.fillText(name, 220, 160)

  ctx.fillStyle = "#444"
  ctx.font = "20px Sans-serif"
  ctx.fillText(position, 220, 190)

  ctx.font = "16px Sans-serif"

  ctx.fillText(`Member ID: ${cardNumber}`, 220, 225)
  ctx.fillText(`Valid Till: ${expiryDate}`, 220, 250)

  if (phone) {
    ctx.fillText(`Phone: ${phone}`, 220, 275)
  }

  if (address) {
    wrapText(address, 220, 300, CARD_WIDTH - 240, 18)
  }

  /* ---------------- Footer ---------------- */

  ctx.fillStyle = theme.primary
  ctx.fillRect(0, CARD_HEIGHT - 60, CARD_WIDTH, 60)

  ctx.fillStyle = "#ffffff"
  ctx.font = "16px Sans-serif"

  const ngoAddress = ngo.address || "NGO Address not available"

  wrapText(ngoAddress, 20, CARD_HEIGHT - 35, CARD_WIDTH - 40, 18)

  /* ---------------- Output ---------------- */

  return canvas.toBuffer("image/png")
}

export default generateIDCard