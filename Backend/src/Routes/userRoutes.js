import express from 'express'
import { getUserDetails , changePassword , getMembershipStatus , uploadOrUpdateProfilePicture,updateProfile ,completeProfile} from "../Controllers/userControllers.js"
import { verifyAuthToken } from "../middlewares/authMiddlewares.js"
import { handleMulterErrors } from '../middlewares/upload.js'

const userRouter = express.Router()
userRouter.get('/get-user-details',verifyAuthToken, getUserDetails)
userRouter.post('/complete-profile/:userId',verifyAuthToken, completeProfile)
userRouter.post('/change-password/:userId',verifyAuthToken, changePassword)
userRouter.get('/membership-status/:userId',verifyAuthToken, getMembershipStatus)
userRouter.patch('/update-profile/:userId',verifyAuthToken, updateProfile)
userRouter.put('/profile-picture/:userId',verifyAuthToken, handleMulterErrors('profile'), uploadOrUpdateProfilePicture)

export default userRouter