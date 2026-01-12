// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken"

/* =========================
   VERIFY ACCESS TOKEN
   (Used for ALL protected APIs)
========================= */
const verifyAccessToken = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      })
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Access token expired"
          : "Invalid access token",
    })
  }
}

/* =========================
   VERIFY REFRESH TOKEN
   (Used ONLY for /auth/refresh)
========================= */
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

/* =========================
   ROLE-BASED AUTH
   (Runs AFTER verifyAccessToken)
========================= */
const protectedRoute = (req, res, next) => {
  try {
    const user = req.user

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

export {
  verifyAccessToken,
  verifyRefreshToken,
  protectedRoute
}
