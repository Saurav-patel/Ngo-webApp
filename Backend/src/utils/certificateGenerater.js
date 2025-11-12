import { createCanvas, loadImage } from "canvas"

const generateCertificate = async ({
  name,
  ngoName,
  regNo,
  presidentName,
  logoPath,     // use relative or absolute path
  signPath,     // these can be URLs or static assets
}) => {
  const width = 1123  // A4 landscape ratio at 96 DPI
  const height = 794
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Background
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, width, height)

  // Gold double border
  ctx.strokeStyle = "#bfa14a"
  ctx.lineWidth = 12
  ctx.strokeRect(25, 25, width - 50, height - 50)
  ctx.lineWidth = 4
  ctx.strokeRect(45, 45, width - 90, height - 90)

  // Logo
  try {
    const logo = await loadImage(logoPath)
    const logoSize = 100
    ctx.drawImage(logo, width / 2 - logoSize / 2, 70, logoSize, logoSize)
  } catch (err) {
    console.warn("Logo not found or failed to load:", err.message)
  }

  // NGO Name
  ctx.font = "bold 28px 'Times New Roman'"
  ctx.fillStyle = "#000"
  ctx.textAlign = "center"
  ctx.fillText(ngoName || "Better Hope NGO", width / 2, 210)

  // Registration No.
  if (regNo) {
    ctx.font = "16px Arial"
    ctx.fillStyle = "#444"
    ctx.fillText(`Reg. No.: ${regNo}`, width / 2, 240)
  }

  // Title
  ctx.font = "60px 'Great Vibes'"
  ctx.fillStyle = "#bfa14a"
  ctx.fillText("Certificate of Appreciation", width / 2, 320)

  // Intro Text
  ctx.font = "18px 'Times New Roman'"
  ctx.fillStyle = "#000"
  const introText = `At ${ngoName || "Better Hope NGO"}, we would like to extend our highest appreciation to`
  wrapText(ctx, introText, width / 2, 370, 800, 24)

  // Recipient Name
  ctx.font = "bold 34px 'Times New Roman'"
  ctx.fillStyle = "#000"
  ctx.fillText(name, width / 2, 440)
  ctx.beginPath()
  ctx.moveTo(width / 2 - 120, 450)
  ctx.lineTo(width / 2 + 120, 450)
  ctx.strokeStyle = "#000"
  ctx.lineWidth = 1
  ctx.stroke()

  // Body Text
  const bodyText =
    "For working tirelessly to provide support to those who needed it most. " +
    "Please accept our heartfelt appreciation for your dedication and selfless service."
  wrapText(ctx, bodyText, width / 2, 510, 850, 24)

  // Signature
  try {
    const sign = await loadImage(signPath)
    const signW = 180
    ctx.drawImage(sign, width / 2 - signW / 2, height - 180, signW, 70)
  } catch (err) {
    console.warn("Signature not found or failed to load:", err.message)
  }

  // President Name & Designation
  ctx.font = "bold 18px Arial"
  ctx.fillStyle = "#000"
  ctx.fillText(presidentName, width / 2, height - 80)
  ctx.font = "14px Arial"
  ctx.fillText("President", width / 2, height - 60)

  return canvas.toBuffer("image/png")
}

// Text wrapping helper
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ")
  let line = ""
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " "
    const testWidth = ctx.measureText(testLine).width
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y)
      line = words[n] + " "
      y += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, y)
}

export default generateCertificate
