import Ngo from "../Models/ngoModel.js";
import Document from "../Models/documentModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


const aboutNgo = async (req , res) => {
    try {
        const ngo = await Ngo.findOne().lean()
        if (!ngo) {
            return res.status(404).json({
                success: false,
                message: "NGO information not found"
            })
        }

        const documents = await Document.find()
        .sort({ createdAt: -1 })
        .lean()

        if(!documents || documents.length === 0){
            return res.status(200).json({
                success: true,
                message: "NGO information fetched successfully, but no documents found",
                data: {
                    ngo,
                    documents: []
                }
            })
        }
        return res.status(200).json({
            success: true,
            message: "NGO information and documents fetched successfully",
            data: {
                ngo,
                documents
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

export { aboutNgo }