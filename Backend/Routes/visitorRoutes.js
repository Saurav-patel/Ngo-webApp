import express from 'express'
import { addVisitor , deleteVisitor , allVisitor , getVisitorInfo } from '../Controllers/visitorControllers.js'
import { protectedRoute } from '../utils/middlewares.js'
const visitorRouter = express.Router()

visitorRouter.post('/addVisitor'  , addVisitor)
visitorRouter.get('/allVisitor' , protectedRoute , allVisitor)
visitorRouter.delete('/deleteVisitor' , protectedRoute , deleteVisitor)
visitorRouter.get('/getVisitorInfo/:visitorId' , protectedRoute , getVisitorInfo)

export default visitorRouter