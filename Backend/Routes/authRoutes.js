import express from 'express'
import { login , logout ,refreshAccessToken , signUp } from '../controllers/authControllers.js'
import { verifyRefreshToken } from '../utils/middlewares.js'

const authRouter = express.Router()
authRouter.post('/login', login)
authRouter.post('/refresh-token', verifyRefreshToken,refreshAccessToken)
authRouter.post('/logout', logout)
authRouter.post('/signup', signUp)

export default authRouter