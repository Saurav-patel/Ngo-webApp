import express from 'express'
import { getUserDetails , changePassword , getMembershipStatus , updateProfilePicture,uploadProfilePicture} from '../controllers/userControllers.js'
import { verifyAccessToken } from '../utils/middlewares.js'
import { handleMulterErrors } from '../utils/uploadConfig.js'

const userRouter = express.Router()
userRouter.get('/get-user-details/:userId',verifyAccessToken, getUserDetails)
userRouter.post('/change-password/:userId',verifyAccessToken, changePassword)
userRouter.get('/membership-status/:userId',verifyAccessToken, getMembershipStatus)
userRouter.post('/upload-profile-picture/:userId',verifyAccessToken, handleMulterErrors('profile'), uploadProfilePicture)
userRouter.put('/update-profile-picture/:userId',verifyAccessToken, handleMulterErrors('profile'), updateProfilePicture)

export default userRouter