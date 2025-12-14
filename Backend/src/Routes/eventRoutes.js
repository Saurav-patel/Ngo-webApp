import express from 'express'
import { createEvent, getAllEvents, deleteEvent, updateEvent, getSingleEvent } from '../Controllers/eventControllers.js'
import { handleMulterErrors } from '../middlewares/upload.js'
import { protectedRoute, verifyAuthToken } from "../middlewares/authMiddlewares.js"

const eventRouter = express.Router()

// Upload event photos with max 8 files
eventRouter.post('/create-event',verifyAuthToken, protectedRoute, handleMulterErrors('event'), createEvent)
eventRouter.get('/all-events', getAllEvents)
eventRouter.get('/single-event/:eventId',  getSingleEvent)
eventRouter.put('/update-event/:eventId', verifyAuthToken , protectedRoute,  handleMulterErrors('event') , updateEvent)
eventRouter.delete('/delete-event/:eventId', verifyAuthToken , protectedRoute ,deleteEvent)

export default eventRouter
