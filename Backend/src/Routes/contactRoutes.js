import {createContactRequest, getContactRequests , updateContactRequestStatus, deleteContactRequest, getContactRequestById , getRequestStatus } from "../Controllers/contactControllers.js";

import express from "express";
import {  verifyAccessToken,protectedRoute } from "../middlewares/authMiddlewares.js";

const contactRouter = express.Router()

contactRouter.post('/create-contact-request', createContactRequest)
contactRouter.get('/contact-requests', verifyAccessToken, protectedRoute , getContactRequests)
contactRouter.patch('/update-contact-request-status/:id', verifyAccessToken ,protectedRoute, updateContactRequestStatus)
contactRouter.delete('/delete-contact-request/:id', verifyAccessToken ,protectedRoute, deleteContactRequest)
contactRouter.get('/contact-request/:id', verifyAccessToken, protectedRoute, getContactRequestById)
contactRouter.get('/contact-request-status/:id', getRequestStatus)
export default contactRouter