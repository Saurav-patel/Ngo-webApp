import { createDonationOrder, donationStats, donationWebhook, getAllDonations, getDonationHistory, getDonationStatus, getSingleDonation, verifyDonationPayment} from "../Controllers/donationControllers.js";
import express from "express";
import {protectedRoute , verifyAccessToken} from "../middlewares/authMiddlewares.js"
const donationRouter = express.Router()

donationRouter.post('/create-order', createDonationOrder)
donationRouter.post('/verify-donation', verifyDonationPayment)
donationRouter.get('/my-donations',verifyAccessToken,getDonationHistory)
donationRouter.get('/all-donations',verifyAccessToken, protectedRoute, getAllDonations)
donationRouter.get('/single-donation/:donationId',verifyAccessToken, protectedRoute, getSingleDonation)
donationRouter.get('/donation-stats',verifyAccessToken, protectedRoute, donationStats)
donationRouter.post('/webhook', donationWebhook)
donationRouter.get('/status/:orderId', getDonationStatus)

export default donationRouter