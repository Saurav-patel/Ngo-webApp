import express from 'express'
import { getUserDetails , changePassword , getMembershipStatus } from '../controllers/userControllers.js'
import { verifyAccessToken } from '../utils/middlewares.js'

const userRouter = express.Router()
userRouter.get('/get-user-details/:userId',verifyAccessToken, getUserDetails)
userRouter.post('/change-password/:userId',verifyAccessToken, changePassword)
userRouter.get('/membership-status/:userId',verifyAccessToken, getMembershipStatus)

export default userRouter