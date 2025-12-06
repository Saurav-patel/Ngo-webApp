import {createContactRequest, getContactRequests } from "../Controllers/contactControllers.js";

import express from "express";
import {  protectedRoute } from "../middlewares/authMiddlewares.js";

const contactRouter = express.Router()

contactRouter.post('/create-contact-request', createContactRequest)
contactRouter.get('/contact-requests', protectedRoute, getContactRequests)
export default contactRouter