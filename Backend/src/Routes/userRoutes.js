import express from 'express'
import { getUserDetails , changePassword , getMembershipStatus , uploadOrUpdateProfilePicture,updateProfile ,completeProfile} from "../Controllers/userControllers.js"
import { verifyAccessToken } from "../middlewares/authMiddlewares.js"
import { handleMulterErrors } from '../middlewares/upload.js'

const userRouter = express.Router()
userRouter.get('/me/get-user-details',verifyAccessToken, getUserDetails)
userRouter.post('/me/complete-profile',verifyAccessToken, completeProfile)
userRouter.post('/me/change-password',verifyAccessToken, changePassword)
userRouter.get('/me/membership-status',verifyAccessToken, getMembershipStatus)
userRouter.patch('/me/update-profile',verifyAccessToken, updateProfile)
userRouter.put('/me/profile-picture',verifyAccessToken, handleMulterErrors('profile'), uploadOrUpdateProfilePicture)
export default userRouter