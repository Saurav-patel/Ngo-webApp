import express from 'express';
import { registerParticipant , myParticipation , allParticipants , updateStatus ,userParticipation } from '../Controllers/participationControllers.js';
import { protectedRoute } from '../utils/middlewares.js';

const participationRouter = express.Router()
participationRouter.post('/register/:eventId', protectedRoute , registerParticipant)
participationRouter.get('/my-participation/:userId',  myParticipation)
participationRouter.get('/all-participants/:eventId', protectedRoute , allParticipants)
participationRouter.get('/user-participation/:userId', protectedRoute , userParticipation)
participationRouter.put('/update-status/:participationId', protectedRoute , updateStatus)

export default participationRouter