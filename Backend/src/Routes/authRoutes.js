import express from 'express'
import { createAdmin, getCurrentUser, login , logout ,refreshAccessToken , signUp } from "../Controllers/authControllers.js"
import { protectedRoute, verifyAccessToken , verifyRefreshToken } from "../middlewares/authMiddlewares.js"
import { create } from 'qrcode'

const authRouter = express.Router()
authRouter.post('/login', login)
authRouter.post('/refresh', verifyRefreshToken ,refreshAccessToken)
authRouter.post('/logout', logout)
authRouter.post('/signup', signUp)
authRouter.post('/create-admin',verifyAccessToken,protectedRoute ,createAdmin)
authRouter.get('/get-currentUser',verifyAccessToken, getCurrentUser)
export default authRouter