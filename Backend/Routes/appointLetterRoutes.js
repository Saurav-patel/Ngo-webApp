import express from 'express';
import { getPendingAndGeneratedAppointmentLetter , applyAppointmentLetter, myLetters , visitorLetter} from '../Controllers/appointLetterControllers.js';
import { protectedRoute } from '../utils/middlewares.js';

const appointLetterRouter = express.Router()
appointLetterRouter.post('/apply-appointment-letter',  applyAppointmentLetter)
appointLetterRouter.get('/all-appointment-letters', protectedRoute , getPendingAndGeneratedAppointmentLetter)
appointLetterRouter.get('/my-letters/:userId',myLetters)
appointLetterRouter.post('/visitor-letter', visitorLetter)

export default appointLetterRouter