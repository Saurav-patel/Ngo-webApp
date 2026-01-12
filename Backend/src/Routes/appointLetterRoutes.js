import express from 'express';
import { getPendingAndGeneratedAppointmentLetter , applyAppointmentLetter, myLetters , visitorLetter, generateLetter} from '../Controllers/appointLetterControllers.js';
import { protectedRoute, verifyAccessToken } from '../middlewares/authMiddlewares.js';

const appointLetterRouter = express.Router()
appointLetterRouter.post('/apply-appointment-letter',verifyAccessToken ,  applyAppointmentLetter)
appointLetterRouter.get('/all-appointment-letters',verifyAccessToken, protectedRoute , getPendingAndGeneratedAppointmentLetter)
appointLetterRouter.get('/my-letters/:userId',myLetters)
appointLetterRouter.post('/visitor-letter', visitorLetter)
appointLetterRouter.post('/generate-letter',verifyAccessToken,generateLetter)

export default appointLetterRouter