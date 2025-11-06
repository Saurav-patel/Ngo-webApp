import jwt from "jsonwebtoken";

const verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access token missing or invalid" })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Access token expired" })
    } else {
        return res.status(403).json({ message: "Invalid access token" })
    }
  }
}

 const verifyRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing",
    })
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.error("Refresh token verification failed:", error.message)

    return res.status(403).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Refresh token expired"
          : "Invalid refresh token",
    })
  }
}

const protectedRoute = (req , res , next) => {
    try {
        const user = req.user
        
        if(!user){
            return res.status(400).json({message: "Please login"})
        }
        if(user.role !== 'admin'){
            return res.status(403).json({message: "You are not authorized to access this route"})
        }
        next()
    } catch (error) {
        return res.status(400).json({message: "This route is protected"})
    }
}

export { verifyAccessToken , verifyRefreshToken , protectedRoute }