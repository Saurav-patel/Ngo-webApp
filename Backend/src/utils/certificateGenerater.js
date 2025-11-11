import { createCanvas, loadImage } from "canvas"

const generateCertificate = async ({ name, type, eventName, issueDate, templateUsed = "default" }) => {
  const width = 1000
  const height = 700
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  // Border
  ctx.strokeStyle = "#1a1a1a"
  ctx.lineWidth = 8
  ctx.strokeRect(20, 20, width - 40, height - 40)

  // Title
  ctx.font = "bold 48px Arial"
  ctx.fillStyle = "#2c3e50"
  ctx.textAlign = "center"
  ctx.fillText("Certificate of " + type, width / 2, 150)

  // Recipient Name
  ctx.font = "bold 60px Arial"
  ctx.fillStyle = "#000000"
  ctx.fillText(name, width / 2, 300)

  // Event Name (if applicable)
  if (eventName) {
    ctx.font = "28px Arial"
    ctx.fillStyle = "#444"
    ctx.fillText(`For participation in ${eventName}`, width / 2, 380)
  }

  // Issue Date
  ctx.font = "24px Arial"
  ctx.fillStyle = "#555"
  ctx.fillText(`Issued on: ${new Date(issueDate).toLocaleDateString()}`, width / 2, 460)

  // Footer
  ctx.font = "italic 22px Arial"
  ctx.fillStyle = "#888"
  ctx.fillText("Issued by NGO Management System", width / 2, height - 80)

  return canvas.toBuffer("image/png")
}

export default generateCertificate
