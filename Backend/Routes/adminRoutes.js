import express from 'express'
import { getAllUsers, deleteUser, getMembers, addMemberInfo, uploadNgoDocuments as uploadNgoDocumentsController } from '../controllers/adminControllers.js'
import { protectedRoute } from '../utils/middlewares.js'
import { handleMulterErrors } from '../utils/uploadConfig.js'

const adminRouter = express.Router()

adminRouter.get('/all-users', protectedRoute, getAllUsers)
adminRouter.post('/delete-user', protectedRoute, deleteUser)
adminRouter.get('/members', protectedRoute, getMembers)

// Upload NGO documents (multiple files, PDF/JPEG/PNG)
adminRouter.post('/upload-ngo-documents', protectedRoute, handleMulterErrors('documents'), uploadNgoDocumentsController)

// Add member (single profile photo)
adminRouter.post('/add-member', protectedRoute, handleMulterErrors('profile'), addMemberInfo)

export default adminRouter
