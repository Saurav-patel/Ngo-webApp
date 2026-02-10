import { createDonationOrder } from "../Controllers/donationControllers.js";
import express from "express";
import { verifyDonationPayment } from "../Controllers/verifyDonation.js";
const donationRouter = express.Router()

donationRouter.post('/create-order', createDonationOrder)
donationRouter.post('/verify-donation', verifyDonationPayment)

export default donationRouter