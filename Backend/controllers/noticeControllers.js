import mongoose from "mongoose"
import Notice from "../Models/noticeModel.js"


const addNotice = async (req, res) => {
  try {
    const { title, body, category, isPinned, expiresAt } = req.body
    const createdBy = req.user?._id  

    
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required"
      })
    }

    
    const validCategories = ["General", "Event", "Urgent"]
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Valid categories are: ${validCategories.join(", ")}`
      })
    }

    
    let expiration = null
    if (expiresAt) {
      const parsedDate = new Date(expiresAt)
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiration date"
        })
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

    return res.status(201).json({
      success: true,
      message: "Notice added successfully",
      data: notice
    })
  } catch (error) {
    console.error("Error adding notice:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}


import mongoose from "mongoose"
import Notice from "../Models/noticeModel.js"

const editNotice = async (req, res) => {
  try {
    const { noticeId } = req.params
    const { title, body, category, isPinned, expiresAt } = req.body

    
    if (!mongoose.Types.ObjectId.isValid(noticeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice ID"
      })
    }

    
    const notice = await Notice.findById(noticeId)
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found"
      })
    }

   
    const validCategories = ["General", "Event", "Urgent"]
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Valid categories are: ${validCategories.join(", ")}`
      })
    }


    let expirationDate = notice.expiresAt
    if (expiresAt) {
      const parsedDate = new Date(expiresAt)
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiration date"
        })
      }
      
      expirationDate = parsedDate
    }
    
    notice.title = title || notice.title
    notice.body = body || notice.body
    notice.category = category || notice.category
    notice.isPinned = isPinned !== undefined ? isPinned : notice.isPinned
    notice.expiresAt = expirationDate

    await notice.save()

    return res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      data: notice
    })

  } catch (error) {
    console.error("Error editing notice:", error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

const deleteNotice = async (req , res) => {
    try {
        const {noticeId} = req.params
        if(!mongoose.Types.ObjectId.isValid(noticeId)){
            return res.status(400).json({
                success: false,
                message: "Invalid notice ID"
            })
        }
        const notice = await Notice.findById(noticeId)
        if(!notice){
            return res.status(404).json({
                success: false,
                message: "Notice not found"
            })
        }
        await Notice.findByIdAndDelete(notice._id)

        return res.status(200).json({
            success: true,
            message: "Notice deleted successfully"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const getAllNotice = async (req , res) => {
    try {
        const allNotice = await Notice.find().sort({createdAt : -1})
        return res.status(200).json({
            success: true,
            message: "Notices fetched successfully",
            data: allNotice
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const getSingleNotice = async (req , res) => {
    try {
        const { noticeId } =  req.params
        if(!mongoose.Types.ObjectId.isValid(noticeId)){
            return res.status(400).json({
                success: false,
                message: "Invalid notice ID"
            })
        }
        const notice = await Notice.findById(noticeId)
        if(!notice){
            return res.status(404).json({
                success: false,
                message: "Notice not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Notice fetched successfully",
            data: notice
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
export { addNotice , editNotice , deleteNotice , getAllNotice , getSingleNotice }
