const maskAadhaar = (aadhaar) => {
  const clean = aadhaar.replace(/\s+/g, "")
  if (clean.length !== 12) {
    throw new ApiError(400, "Invalid Aadhaar number")
  }

  return `XXXX-XXXX-${clean.slice(-4)}`
}
export { maskAadhaar }