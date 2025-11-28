import express from 'express'
import { getUserDetails , changePassword , getMembershipStatus , updateProfilePicture , uploadProfilePicture , completeProfile} from '../controllers/userControllers.js'
import { verifyAccessToken } from "../middlewares/authMiddlewares.js"
import { handleMulterErrors } from '../middlewares/upload.js'

const userRouter = express.Router()
userRouter.get('/get-user-details/:userId',verifyAccessToken, getUserDetails)
userRouter.post('/complete-profile/:userId',verifyAccessToken, completeProfile)
userRouter.post('/change-password/:userId',verifyAccessToken, changePassword)
userRouter.get('/membership-status/:userId',verifyAccessToken, getMembershipStatus)
userRouter.post('/upload-profile-picture/:userId',verifyAccessToken, handleMulterErrors('profile'), uploadProfilePicture)
userRouter.patch('/update-profile-picture/:userId',verifyAccessToken, handleMulterErrors('profile'), updateProfilePicture)

export default userRouter