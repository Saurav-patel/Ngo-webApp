import { ApiError } from "../utils/apiError.js";

const errorHandler = (err, req, res, next) => {
  console.log("Error caught by middleware:", err)

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data
    })
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  })
}

export { errorHandler }