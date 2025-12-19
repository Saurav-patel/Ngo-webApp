import express from 'express'
import { getUserDetails , changePassword , getMembershipStatus , uploadOrUpdateProfilePicture,updateProfile ,completeProfile} from "../Controllers/userControllers.js"
import { verifyAuthToken } from "../middlewares/authMiddlewares.js"
import { handleMulterErrors } from '../middlewares/upload.js'

const userRouter = express.Router()
userRouter.get('/me/get-user-details',verifyAuthToken, getUserDetails)
userRouter.post('/me/complete-profile',verifyAuthToken, completeProfile)
userRouter.post('/me/change-password',verifyAuthToken, changePassword)
userRouter.get('/me/membership-status',verifyAuthToken, getMembershipStatus)
userRouter.patch('/me/update-profile',verifyAuthToken, updateProfile)
userRouter.put('/me/profile-picture',verifyAuthToken, handleMulterErrors('profile'), uploadOrUpdateProfilePicture)
export default userRouter