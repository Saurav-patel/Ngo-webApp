import express from 'express'
import { addVisitor , deleteVisitor , allVisitor , getVisitorInfo } from '../Controllers/visitorControllers.js'
import { protectedRoute, verifyAccessToken } from '../utils/middlewares.js'
const visitorRouter = express.Router()

visitorRouter.post('/addVisitor'  , addVisitor)
visitorRouter.get('/allVisitor' , verifyAccessToken , protectedRoute , allVisitor)
visitorRouter.delete('/deleteVisitor' , verifyAccessToken ,protectedRoute , deleteVisitor)
visitorRouter.get('/getVisitorInfo/:visitorId' , verifyAccessToken ,protectedRoute , getVisitorInfo)

export default visitorRouter