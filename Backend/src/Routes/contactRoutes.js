import {createContactRequest, getContactRequests , updateContactRequestStatus, deleteContactRequest, getContactRequestById , getRequestStatus } from "../Controllers/contactControllers.js";

import express from "express";
import {  verifyAuthToken,protectedRoute } from "../middlewares/authMiddlewares.js";

const contactRouter = express.Router()

contactRouter.post('/create-contact-request', createContactRequest)
contactRouter.get('/contact-requests', verifyAuthToken, protectedRoute , getContactRequests)
contactRouter.put('/update-contact-request-status/:id', verifyAuthToken ,protectedRoute, updateContactRequestStatus)
contactRouter.delete('/delete-contact-request/:id', verifyAuthToken ,protectedRoute, deleteContactRequest)
contactRouter.get('/contact-request/:id', verifyAuthToken, protectedRoute, getContactRequestById)
contactRouter.get('/contact-request-status/:id', getRequestStatus)
export default contactRouter