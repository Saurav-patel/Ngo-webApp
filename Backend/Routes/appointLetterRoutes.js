import express from 'express';
import { getPendingAndGeneratedAppointmentLetter , applyAppointmentLetter, myLetters , visitorLetter, generateAppointmentLetter} from '../Controllers/appointLetterControllers.js';
import { protectedRoute, verifyAccessToken } from '../utils/middlewares.js';

const appointLetterRouter = express.Router()
appointLetterRouter.post('/apply-appointment-letter',verifyAccessToken,  applyAppointmentLetter)
appointLetterRouter.get('/all-appointment-letters',verifyAccessToken, protectedRoute , getPendingAndGeneratedAppointmentLetter)
appointLetterRouter.get('/my-letters/:userId',myLetters)
appointLetterRouter.post('/visitor-letter', visitorLetter)
appointLetterRouter.post('/generate-letter',verifyAccessToken,generateAppointmentLetter)

export default appointLetterRouter