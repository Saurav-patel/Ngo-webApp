import express from 'express'
import { getUserDetails , changePassword , getMembershipStatus , updateProfilePicture , uploadProfilePicture , completeProfile} from "../Controllers/userControllers.js"
import { verifyAuthToken } from "../middlewares/authMiddlewares.js"
import { handleMulterErrors } from '../middlewares/upload.js'

const userRouter = express.Router()
userRouter.get('/get-user-details',verifyAuthToken, getUserDetails)
userRouter.post('/complete-profile/:userId',verifyAuthToken, completeProfile)
userRouter.post('/change-password/:userId',verifyAuthToken, changePassword)
userRouter.get('/membership-status/:userId',verifyAuthToken, getMembershipStatus)
userRouter.post('/upload-profile-picture/:userId',verifyAuthToken, handleMulterErrors('profile'), uploadProfilePicture)
userRouter.patch('/update-profile-picture/:userId',verifyAuthToken, handleMulterErrors('profile'), updateProfilePicture)

export default userRouter