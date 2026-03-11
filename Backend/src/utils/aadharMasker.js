const maskAadhaar = (aadhaar) => {

  if (!aadhaar) {
    throw new ApiError(400, "Aadhaar number is required")
  }

  const clean = String(aadhaar).replace(/\D/g, "")

  if (clean.length !== 12) {
    throw new ApiError(400, "Invalid Aadhaar number")
  }

  return `XXXX-XXXX-${clean.slice(-4)}`
}

export { maskAadhaar }