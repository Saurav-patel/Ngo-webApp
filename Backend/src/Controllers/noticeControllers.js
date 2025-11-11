import mongoose from "mongoose"
import Notice from "../Models/noticeModel.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const addNotice = async (req, res, next) => {
  try {
    const { title, body, category, isPinned, expiresAt } = req.body
    const createdBy = req.user?._id
    const user = req.user

    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Only admin can add a notice")
    }

    if (!title || !body) {
      throw new ApiError(400, "Title and body are required")
    }

    const validCategories = ["General", "Event", "Urgent"]
    if (category && !validCategories.includes(category)) {
      throw new ApiError(400, `Invalid category. Valid options: ${validCategories.join(", ")}`)
    }

    let expiration = null
    if (expiresAt) {
      const parsedDate = new Date(expiresAt)
      if (isNaN(parsedDate.getTime())) {
        throw new ApiError(400, "Invalid expiration date")
      }
      expiration = parsedDate
    } else {
      expiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }

    const notice = await Notice.create({
      title,
      body,
      category: category || "General",
      isPinned: !!isPinned,
      createdBy,
      expiresAt: expiration
    })

    return res.status(201).json(new ApiResponse(201, notice, "Notice added successfully"))
  } catch (error) {
    next(error)
  }
}

const editNotice = async (req, res, next) => {
  try {
    const { noticeId } = req.params
    const { title, body, category, isPinned, expiresAt } = req.body
    const user = req.user

    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Only admin can edit a notice")
    }

    if (!mongoose.Types.ObjectId.isValid(noticeId)) {
      throw new ApiError(400, "Invalid notice ID")
    }

    const notice = await Notice.findById(noticeId)
    if (!notice) {
      throw new ApiError(404, "Notice not found")
    }

    const validCategories = ["General", "Event", "Urgent"]
    if (category && !validCategories.includes(category)) {
      throw new ApiError(400, `Invalid category. Valid options: ${validCategories.join(", ")}`)
    }

    let expirationDate = notice.expiresAt
    if (expiresAt) {
      const parsedDate = new Date(expiresAt)
      if (isNaN(parsedDate.getTime())) {
        throw new ApiError(400, "Invalid expiration date")
      }
      expirationDate = parsedDate
    }

    notice.title = title || notice.title
    notice.body = body || notice.body
    notice.category = category || notice.category
    notice.isPinned = isPinned !== undefined ? isPinned : notice.isPinned
    notice.expiresAt = expirationDate

    await notice.save()

    return res.status(200).json(new ApiResponse(200, notice, "Notice updated successfully"))
  } catch (error) {
    next(error)
  }
}

const deleteNotice = async (req, res, next) => {
  try {
    const { noticeId } = req.params
    const user = req.user

    if (!user || user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Only admin can delete a notice")
    }

    if (!mongoose.Types.ObjectId.isValid(noticeId)) {
      throw new ApiError(400, "Invalid notice ID")
    }

    const notice = await Notice.findById(noticeId)
    if (!notice) {
      throw new ApiError(404, "Notice not found")
    }

    await Notice.findByIdAndDelete(notice._id)
    return res.status(200).json(new ApiResponse(200, null, "Notice deleted successfully"))
  } catch (error) {
    next(error)
  }
}

const getAllNotice = async (req, res, next) => {
  try {
    const allNotice = await Notice.find().sort({ createdAt: -1 })
    return res.status(200).json(new ApiResponse(200, allNotice, "Notices fetched successfully"))
  } catch (error) {
    next(error)
  }
}

const getSingleNotice = async (req, res, next) => {
  try {
    const { noticeId } = req.params

    if (!mongoose.Types.ObjectId.isValid(noticeId)) {
      throw new ApiError(400, "Invalid notice ID")
    }

    const notice = await Notice.findById(noticeId)
    if (!notice) {
      throw new ApiError(404, "Notice not found")
    }

    return res.status(200).json(new ApiResponse(200, notice, "Notice fetched successfully"))
  } catch (error) {
    next(error)
  }
}

export { addNotice, editNotice, deleteNotice, getAllNotice, getSingleNotice }
