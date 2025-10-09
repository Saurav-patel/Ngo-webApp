import express from 'express'
import { login , logout ,refreshAccessToken } from '../controllers/authControllers.js'

const authRouter = express.Router()
authRouter.post('/login', login)
authRouter.post('/refresh-token', refreshAccessToken)
authRouter.post('/logout', logout)

export default authRouter