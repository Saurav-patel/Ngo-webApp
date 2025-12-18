import express from "express"
import {  applyIdCard, renewIdCard, getMyIdCard, getAllIdCards, getSingleIdCard } from "../Controllers/idCardControllers.js"
import { protectedRoute } from "../middlewares/authMiddlewares.js"
import { verifyAuthToken } from "../middlewares/authMiddlewares.js"

const idCardRouter = express.Router()

idCardRouter.post("/apply",  verifyAuthToken, applyIdCard)
idCardRouter.post("/renew/:cardId", verifyAuthToken, renewIdCard)
idCardRouter.get("/my-card", verifyAuthToken, getMyIdCard)
idCardRouter.get("/all-cards", verifyAuthToken ,protectedRoute, getAllIdCards)
idCardRouter.get("/card/:cardId", verifyAuthToken ,protectedRoute, getSingleIdCard)

export default idCardRouter