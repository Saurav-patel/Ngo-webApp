import express from 'express'
import { getAllUsers , deleteUser , getMembers } from '../controllers/adminControllers.js'
import { protectedRoute } from '../utils/middlewares.js'

const adminRouter = express.Router()
adminRouter.get('/all-users', protectedRoute , getAllUsers)
adminRouter.post('/delete-user', protectedRoute , deleteUser)
adminRouter.get('/members', protectedRoute , getMembers)

export default adminRouter