import express from 'express'
import { getAllUsers, deleteUser, getMembers, addMemberInfo, uploadNgoDocuments as uploadNgoDocumentsController } from '../controllers/adminControllers.js'
import { protectedRoute } from '../utils/middlewares.js'
import { handleMulterErrors } from '../utils/uploadConfig.js'
import { verifyAccessToken } from '../utils/middlewares.js'

const adminRouter = express.Router()

adminRouter.get('/all-users', verifyAccessToken , protectedRoute, getAllUsers)
adminRouter.post('/delete-user', verifyAccessToken , protectedRoute, deleteUser)
adminRouter.get('/members', verifyAccessToken , protectedRoute, getMembers)

// Upload NGO documents (multiple files, PDF/JPEG/PNG)
adminRouter.post('/upload-ngo-documents', verifyAccessToken , protectedRoute, handleMulterErrors('documents'), uploadNgoDocumentsController)

// Add member (single profile photo)
adminRouter.post('/add-member', verifyAccessToken , protectedRoute, handleMulterErrors('profile'), addMemberInfo)

export default adminRouter
