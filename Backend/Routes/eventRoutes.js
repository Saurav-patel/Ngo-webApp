import express from 'express';
import { createEvent, getAllEvents , deleteEvent , updateEvent , getSingleEvent} from '../Controllers/eventControllers.js';
import upload from '../utils/uploadConfig.js';
import { protectedRoute } from '../utils/middlewares.js';

const eventRouter = express.Router()
eventRouter.post('/create-event', upload.single('image'), protectedRoute , createEvent)
eventRouter.get('/all-events', getAllEvents)
eventRouter.get('/single-event/:eventId', getSingleEvent)
eventRouter.put('/update-event/:eventId', protectedRoute , updateEvent)
eventRouter.delete('/delete-event/:eventId', protectedRoute , deleteEvent)

export default eventRouter