import express from 'express'
import { createAdmin, login , logout ,refreshAccessToken , signUp } from '../controllers/authControllers.js'
import { verifyRefreshToken } from '../utils/middlewares.js'
import { create } from 'qrcode'

const authRouter = express.Router()
authRouter.post('/login', login)
authRouter.post('/refresh-token', verifyRefreshToken,refreshAccessToken)
authRouter.post('/logout', logout)
authRouter.post('/signup', signUp)
authRouter.post('/create-admin',createAdmin)

export default authRouter