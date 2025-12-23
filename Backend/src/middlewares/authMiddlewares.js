// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken"

/**
 * ✅ COOKIE-BASED AUTH (REPLACES HEADER-BASED ACCESS TOKEN)
 * Uses httpOnly refreshToken cookie
 */
const verifyAuthToken = (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      })
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    req.user = decoded
    console.log("Verified user:", req.user)
    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Session expired"
          : "Invalid session",
    })
  }
}

/**
 * ✅ OPTIONAL: Keep if you use refresh flow explicitly
 * (can be used for /refresh-token route)
 */
const verifyRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing",
    })
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Refresh token expired"
          : "Invalid refresh token",
    })
  }
}

/**
 * ✅ ROLE-BASED AUTH (UNCHANGED LOGIC)
 * Must run AFTER verifyAccessToken
 */
const protectedRoute = (req, res, next) => {
  try {
    const user = req.user
    console.log(user)
    console.log("Protected route accessed",user.role)

    if (!user) {
      return res.status(401).json({ message: "Please login" })
    }

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to access this route" })
    }

    next()
  } catch (error) {
    return res
      .status(400)
      .json({ message: "This route is protected" })
  }
}

export { verifyAuthToken, verifyRefreshToken, protectedRoute }
