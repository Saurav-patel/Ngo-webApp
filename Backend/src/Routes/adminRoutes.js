import express from 'express'
import {getAllUsers, deleteUser, getMembers , uploadNgoDocuments , addMemberInfo , deleteMember , updateMemberInfo  } from '../controllers/adminControllers.js'
import { protectedRoute } from '../middlewares/authMiddlewares.js'
import { handleMulterErrors } from '../middlewares/upload.js'
import { verifyAccessToken } from '../middlewares/authMiddlewares.js'

const adminRouter = express.Router()

adminRouter.get('/all-users', verifyAccessToken , protectedRoute, getAllUsers)
adminRouter.delete('/delete-user/:userId', verifyAccessToken , protectedRoute, deleteUser)
adminRouter.get('/members', verifyAccessToken , protectedRoute, getMembers)
adminRouter.delete('/delete-member/:memberId', verifyAccessToken , protectedRoute, deleteMember)


adminRouter.post('/upload-ngo-documents', verifyAccessToken , protectedRoute, handleMulterErrors('documents'), uploadNgoDocuments)


adminRouter.post('/add-member', verifyAccessToken , protectedRoute, handleMulterErrors('profile'), addMemberInfo)

adminRouter.put('/update-member/:memberId', verifyAccessToken , protectedRoute, handleMulterErrors('profile'), updateMemberInfo)
export default adminRouter
