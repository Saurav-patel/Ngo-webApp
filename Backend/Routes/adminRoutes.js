import express from 'express'
import {getAllUsers, deleteUser, getMembers , uploadNgoDocuments , addMemberInfo , deleteMember , updateMemberInfo , getNgoMembers } from '../controllers/adminControllers.js'
import { protectedRoute } from '../utils/middlewares.js'
import { handleMulterErrors } from '../utils/uploadConfig.js'
import { verifyAccessToken } from '../utils/middlewares.js'

const adminRouter = express.Router()

adminRouter.get('/all-users', verifyAccessToken , protectedRoute, getAllUsers)
adminRouter.delete('/delete-user', verifyAccessToken , protectedRoute, deleteUser)
adminRouter.get('/members', verifyAccessToken , protectedRoute, getMembers)
adminRouter.delete('/delete-member/:memberId', verifyAccessToken , protectedRoute, deleteMember)

// Upload NGO documents (multiple files, PDF/JPEG/PNG)
adminRouter.post('/upload-ngo-documents', verifyAccessToken , protectedRoute, handleMulterErrors('documents'), uploadNgoDocuments)

// Add member (single profile photo)
adminRouter.post('/add-member', verifyAccessToken , protectedRoute, handleMulterErrors('profile'), addMemberInfo)
adminRouter.get('/ngo-members', verifyAccessToken , protectedRoute, getNgoMembers)
adminRouter.put('/update-member/:memberId', verifyAccessToken , protectedRoute, handleMulterErrors('profile'), updateMemberInfo)
export default adminRouter
