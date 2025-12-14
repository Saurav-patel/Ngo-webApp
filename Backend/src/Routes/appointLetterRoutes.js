import express from 'express';
import { getPendingAndGeneratedAppointmentLetter , applyAppointmentLetter, myLetters , visitorLetter, generateLetter} from '../Controllers/appointLetterControllers.js';
import { protectedRoute, verifyAuthToken } from '../middlewares/authMiddlewares.js';

const appointLetterRouter = express.Router()
appointLetterRouter.post('/apply-appointment-letter',verifyAuthToken ,  applyAppointmentLetter)
appointLetterRouter.get('/all-appointment-letters',verifyAuthToken, protectedRoute , getPendingAndGeneratedAppointmentLetter)
appointLetterRouter.get('/my-letters/:userId',myLetters)
appointLetterRouter.post('/visitor-letter', visitorLetter)
appointLetterRouter.post('/generate-letter',verifyAuthToken,generateLetter)

export default appointLetterRouter