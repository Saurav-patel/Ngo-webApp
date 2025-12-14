import express from 'express';
import { registerParticipant , myParticipation , allParticipants , updateStatus ,userParticipation } from '../Controllers/participationControllers.js';
import { protectedRoute, verifyAuthToken } from "../middlewares/authMiddlewares.js";

const participationRouter = express.Router()
participationRouter.post('/register/:eventId', verifyAuthToken   , registerParticipant)
participationRouter.get('/my-participation', verifyAuthToken , myParticipation)
participationRouter.get('/all-participants/:eventId',verifyAuthToken, protectedRoute , allParticipants)
participationRouter.get('/user-participation/:userId', verifyAuthToken , protectedRoute , userParticipation)
participationRouter.put('/update-status/:participationId',verifyAuthToken ,  protectedRoute , updateStatus)

export default participationRouter