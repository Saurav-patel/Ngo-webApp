import Ngo from "../Models/ngoModel.js"
import Document from "../Models/documentModel.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const aboutNgo = async (req, res, next) => {
  try {
    const ngo = await Ngo.findOne().lean()
    if (!ngo) {
      throw new ApiError(404, "NGO information not found")
    }

    const documents = await Document.find()
      .sort({ createdAt: -1 })
      .lean()

    if (!documents || documents.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { ngo, documents: [] },
            "NGO information fetched successfully, but no documents found"
          )
        )
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ngo, documents },
          "NGO information and documents fetched successfully"
        )
      )
  } catch (error) {
    next(error)
  }
}
const getNgoMembers = async (req, res, next) => {
  try {
    

    const ngo = await Ngo.findOne()
    if (!ngo) {
      throw new ApiError(404, "NGO not found")
    }
    
    const members = ngo.members || []

    return res
      .status(200)
      .json(new ApiResponse(200, members, "Members fetched successfully"))
  } catch (error) {
    next(error)
  }
}
export { aboutNgo , getNgoMembers}
