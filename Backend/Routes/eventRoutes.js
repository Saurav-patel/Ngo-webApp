import express from 'express'
import { createEvent, getAllEvents, deleteEvent, updateEvent, getSingleEvent } from '../Controllers/eventControllers.js'
import { handleMulterErrors } from '../utils/uploadConfig.js'
import { protectedRoute, verifyAccessToken } from '../utils/middlewares.js'

const eventRouter = express.Router()

// Upload event photos with max 8 files
eventRouter.post('/create-event',verifyAccessToken, protectedRoute, handleMulterErrors('event'), createEvent)
eventRouter.get('/all-events', getAllEvents)
eventRouter.get('/single-event/:eventId', verifyAccessToken , getSingleEvent)
eventRouter.put('/update-event/:eventId', verifyAccessToken , protectedRoute, updateEvent)
eventRouter.delete('/delete-event/:eventId', verifyAccessToken , protectedRoute, deleteEvent)

export default eventRouter
