import Visitor from "../Models/visitorModel.js"
import Donation from "../Models/donationModel.js"
import Event from "../Models/eventModel.js"
import Certificate from "../Models/certificateModel.js"

const addVisitor = async (req, res) => {
  try {
    const { name, email, phone, address, eventId } = req.body
    const createdBy = req.user._id 

    
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
      createdBy
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

export default addVisitor
