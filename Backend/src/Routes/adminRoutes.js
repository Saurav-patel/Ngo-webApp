import express from 'express'
import {getAllUsers, deleteUser, getMembers , uploadNgoDocuments , addMemberInfo , deleteMember , updateMemberInfo  } from '../controllers/adminControllers.js'
import { protectedRoute } from '../middlewares/authMiddlewares.js'
import { handleMulterErrors } from '../middlewares/upload.js'
import { verifyAuthToken } from '../middlewares/authMiddlewares.js'

const adminRouter = express.Router()

adminRouter.get('/all-users', verifyAuthToken , protectedRoute, getAllUsers)
adminRouter.delete('/delete-user/:userId', verifyAuthToken , protectedRoute, deleteUser)
adminRouter.get('/members', verifyAuthToken , protectedRoute, getMembers)
adminRouter.delete('/delete-member/:memberId', verifyAuthToken , protectedRoute, deleteMember)


adminRouter.post('/upload-ngo-documents', verifyAuthToken , protectedRoute, handleMulterErrors('documents'), uploadNgoDocuments)


adminRouter.post('/add-member', verifyAuthToken , protectedRoute, handleMulterErrors('profile'), addMemberInfo)

adminRouter.put('/update-member/:memberId', verifyAuthToken , protectedRoute, handleMulterErrors('profile'), updateMemberInfo)
export default adminRouter
