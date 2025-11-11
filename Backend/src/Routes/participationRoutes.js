import express from 'express';
import { registerParticipant , myParticipation , allParticipants , updateStatus ,userParticipation } from '../Controllers/participationControllers.js';
import { protectedRoute, verifyAccessToken } from "../middlewares/authMiddlewares.js";

const participationRouter = express.Router()
participationRouter.post('/register/:eventId', verifyAccessToken   , registerParticipant)
participationRouter.get('/my-participation', verifyAccessToken , myParticipation)
participationRouter.get('/all-participants/:eventId',verifyAccessToken, protectedRoute , allParticipants)
participationRouter.get('/user-participation/:userId', verifyAccessToken , protectedRoute , userParticipation)
participationRouter.put('/update-status/:participationId',verifyAccessToken ,  protectedRoute , updateStatus)

export default participationRouter