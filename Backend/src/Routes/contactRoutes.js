import {createContactRequest, getContactRequests , updateContactRequestStatus, deleteContactRequest, getContactRequestById , getRequestStatus } from "../Controllers/contactControllers.js";

import express from "express";
import {  protectedRoute } from "../middlewares/authMiddlewares.js";

const contactRouter = express.Router()

contactRouter.post('/create-contact-request', createContactRequest)
contactRouter.get('/contact-requests', protectedRoute, getContactRequests)
contactRouter.put('/update-contact-request-status/:id', protectedRoute, updateContactRequestStatus)
contactRouter.delete('/delete-contact-request/:id', protectedRoute, deleteContactRequest)
contactRouter.get('/contact-request/:id', protectedRoute, getContactRequestById)
contactRouter.get('/contact-request-status/:id', getRequestStatus)
export default contactRouter