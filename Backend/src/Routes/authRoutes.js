import express from 'express'
import { createAdmin, getCurrentUser, login , logout ,refreshAccessToken , signUp } from "../Controllers/authControllers.js"
import { verifyAuthToken, verifyRefreshToken } from "../middlewares/authMiddlewares.js"
import { create } from 'qrcode'

const authRouter = express.Router()
authRouter.post('/login', login)
authRouter.post('/refresh-token', verifyRefreshToken,refreshAccessToken)
authRouter.post('/logout', logout)
authRouter.post('/signup', signUp)
authRouter.post('/create-admin',createAdmin)
authRouter.get('/get-currentUser',verifyAuthToken, getCurrentUser)
export default authRouter