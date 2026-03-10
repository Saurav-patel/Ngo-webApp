
import { createCanvas, loadImage } from "canvas"

const generateCertificate = async ({
  name,
  ngoName,
  regNo,
  presidentName,
  logoPath,
  signPath
}) => {
  const width = 1123
  const height = 794

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, "#ffffff")
  gradient.addColorStop(1, "#f7f3e9")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = "#bfa14a"
  ctx.lineWidth = 14
  ctx.strokeRect(20, 20, width - 40, height - 40)

  ctx.lineWidth = 4
  ctx.strokeRect(45, 45, width - 90, height - 90)

  ctx.textAlign = "center"

  try {
    const logo = await loadImage(logoPath)
    ctx.drawImage(logo, width / 2 - 60, 70, 120, 120)
  } catch {}

  ctx.fillStyle = "#000"
  ctx.font = "bold 30px 'Times New Roman'"
  ctx.fillText(ngoName || "Better Hope NGO", width / 2, 240)

  if (regNo) {
    ctx.font = "16px Arial"
    ctx.fillStyle = "#555"
    ctx.fillText(`Reg. No: ${regNo}`, width / 2, 270)
  }

  ctx.fillStyle = "#bfa14a"
  ctx.font = "bold 60px 'Times New Roman'"
  ctx.fillText("CERTIFICATE", width / 2, 350)

  ctx.font = "bold 34px 'Times New Roman'"
  ctx.fillText("OF APPRECIATION", width / 2, 390)

  ctx.fillStyle = "#333"
  ctx.font = "18px 'Times New Roman'"
  wrapText(
    ctx,
    `At ${ngoName || "Better Hope NGO"}, we would like to extend our highest appreciation to`,
    width / 2,
    450,
    750,
    28
  )

  ctx.fillStyle = "#000"
  ctx.font = "bold 42px 'Times New Roman'"
  ctx.fillText(name, width / 2, 520)

  ctx.beginPath()
  ctx.moveTo(width / 2 - 160, 535)
  ctx.lineTo(width / 2 + 160, 535)
  ctx.strokeStyle = "#000"
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.font = "18px 'Times New Roman'"
  ctx.fillStyle = "#333"

  const bodyText =
    "For working tirelessly to provide support to those who needed it most. Please accept our heartfelt appreciation for your dedication and selfless service."

  wrapText(ctx, bodyText, width / 2, 585, 800, 28)

  ctx.beginPath()
  ctx.arc(width - 150, height - 170, 70, 0, Math.PI * 2)
  ctx.strokeStyle = "#bfa14a"
  ctx.lineWidth = 6
  ctx.stroke()

  ctx.fillStyle = "#bfa14a"
  ctx.font = "bold 18px Arial"
  ctx.fillText("OFFICIAL", width - 150, height - 180)
  ctx.fillText("SEAL", width - 150, height - 155)

  try {
    const sign = await loadImage(signPath)
    ctx.drawImage(sign, width / 2 - 90, height - 180, 180, 70)
  } catch {}

  ctx.font = "bold 20px Arial"
  ctx.fillStyle = "#000"
  ctx.fillText(presidentName || "President", width / 2, height - 85)

  ctx.font = "14px Arial"
  ctx.fillText("President", width / 2, height - 60)

  return canvas.toBuffer("image/png")
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ")
  let line = ""

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " "
    const width = ctx.measureText(testLine).width

    if (width > maxWidth && n > 0) {
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

