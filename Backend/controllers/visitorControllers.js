import Visitor from "../Models/visitorModel.js"
import Event from "../Models/eventModel.js"


const addVisitor = async (req, res) => {
  try {
    const { name, email, phone, address, eventId } = req.body
    

    
    if (!name || !email || !eventId) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and event participation (eventId) are required"
      })
    }

    
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found. Visitor can only be created if they participate in a valid event"
      })
    }

    
    const existingVisitor = await Visitor.findOne({ email: email.toLowerCase() })
    if (existingVisitor) {
      return res.status(400).json({
        success: false,
        message: "Visitor with this email already exists"
      })
    }

    
    const visitor = await Visitor.create({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      events: [eventId],
      
    })

    return res.status(201).json({
      success: true,
      message: "Visitor added successfully",
      data: visitor
    })
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

const allVisitor = async (req , res) => {
  try {
    const visitors = await Visitor.find()
    
    const countVisitors = await Visitor.countDocuments()
    if(countVisitors <= 0){
      return res.status(404).json({
        success: false,
        message: "Dont have any visitor"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Visitors fetched successfully",
      data:{
        countVisitors,
        visitors
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

const deleteVisitor = async (req , res) => {
  try {
    const {email} = req.body
    if(!email){
      return res.status(400).json({
        success: false,
        message: "Please provide email to delete a user"
      })
    }

    const visitor = await Visitor.findOne({email})
    if(!visitor){
      return res.status(404).json({
        success: false,
        message: "Cant find visitor"
      })
    }

    await Visitor.deleteOne({email})

    return res.status(200).json({
      success: true,
      message: "Visitor deleted successfully"
    })


  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Error while deleting visitor"
    })
  }
}


const getVisitorInfo = async (req , res) => {
  try {
    const { visitorId } = req.params
     if (!mongoose.Types.ObjectId.isValid(visitorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visitor ID"
      })
    }

    if(!visitorId){
      return res.status(400).json({
        success: false,
        message: "Please provide visitor ID"
      })
    }
    const visitorInfo = await Visitor.findById(visitorId)
      .populate("donations", "amount date method") 
      .populate("events", "title date location")   
      .populate("certificates", "type issueDate") 
      .select("-createdBy -updatedAt -__v")       
      if(!visitorInfo){
        return res.status(404).json({
          success: false,
          message: "Visitor not found"
        })
      }

      return res.status(200).json({
        success: true,
        message: "Visitor info fetched successfully",
        data: visitorInfo
      })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Error while fetching visitor info"
    })
  }
}
export  { addVisitor , allVisitor , deleteVisitor , getVisitorInfo}
