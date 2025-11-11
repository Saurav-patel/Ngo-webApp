import express from "express"
import {  applyIdCard, renewIdCard, getMyIdCard, getAllIdCards, getSingleIdCard } from "../Controllers/idCardControllers.js"
import { protectedRoute } from "../middlewares/authMiddlewares.js"
import { verifyAccessToken } from "../middlewares/authMiddlewares.js"

const idCardRouter = express.Router()

idCardRouter.post("/apply",  verifyAccessToken, applyIdCard)
idCardRouter.post("/renew/:cardId", verifyAccessToken, renewIdCard)
idCardRouter.get("/my-card/:userId", verifyAccessToken, getMyIdCard)
idCardRouter.get("/all-cards", verifyAccessToken ,protectedRoute, getAllIdCards)
idCardRouter.get("/card/:cardId", verifyAccessToken ,protectedRoute, getSingleIdCard)

export default idCardRouter