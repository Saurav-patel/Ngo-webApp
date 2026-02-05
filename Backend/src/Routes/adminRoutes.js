import express from 'express'
import {getAllUsers, deleteUser, getMembers , uploadNgoDocuments , addUserByAdmin , deleteMember , updateUserByAdmin , getSingleUser  } from "../Controllers/adminControllers.js"
import { protectedRoute } from '../middlewares/authMiddlewares.js'
import { handleMulterErrors } from '../middlewares/upload.js'
import { verifyAccessToken } from '../middlewares/authMiddlewares.js'

const adminRouter = express.Router()

adminRouter.get('/all-users', verifyAccessToken , protectedRoute, getAllUsers)
adminRouter.get('/single-user/:userId', verifyAccessToken , protectedRoute, getSingleUser)
adminRouter.delete('/delete-user/:userId', verifyAccessToken , protectedRoute, deleteUser)
adminRouter.get('/members', verifyAccessToken , protectedRoute, getMembers)
adminRouter.delete('/delete-member/:memberId', verifyAccessToken , protectedRoute, deleteMember)

adminRouter.post('/upload-ngo-documents', verifyAccessToken , protectedRoute, handleMulterErrors('documents'), uploadNgoDocuments)


adminRouter.post('/add-user', verifyAccessToken , protectedRoute, handleMulterErrors('profile'), addUserByAdmin)

adminRouter.put('/update-user/:userId', verifyAccessToken , protectedRoute, handleMulterErrors('profile'), updateUserByAdmin)
export default adminRouter
