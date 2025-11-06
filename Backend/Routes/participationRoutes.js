import express from 'express';
import { registerParticipant , myParticipation , allParticipants , updateStatus ,userParticipation } from '../Controllers/participationControllers.js';
import { protectedRoute, verifyAccessToken } from '../utils/middlewares.js';

const participationRouter = express.Router()
participationRouter.post('/register/:eventId', verifyAccessToken   , registerParticipant)
participationRouter.get('/my-participation/:userId', verifyAccessToken , myParticipation)
participationRouter.get('/all-participants/:eventId',verifyAccessToken, protectedRoute , allParticipants)
participationRouter.get('/user-participation/:userId', verifyAccessToken , protectedRoute , userParticipation)
participationRouter.put('/update-status/:participationId',verifyAccessToken ,  protectedRoute , updateStatus)

export default participationRouter