
import jwt from "jsonwebtoken"
import User from "../Models/userModel.js"
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

const verifyRefreshToken = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing",
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Refresh token invalid or reused",
      });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};


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
