import express from "express"
import {  applyIdCard, renewIdCard, getMyIdCard, getAllIdCards, getSingleIdCard } from "./idCardControllers.js"

import { verifyAccessToken , protectedRoute} from "../../middlewares/authMiddlewares.js"

const idCardRouter = express.Router()

idCardRouter.post("/apply",  verifyAccessToken, applyIdCard)
idCardRouter.post("/renew/:cardId", verifyAccessToken, renewIdCard)
idCardRouter.get("/my-card", verifyAccessToken, getMyIdCard)
idCardRouter.get("/all-cards", verifyAccessToken ,protectedRoute, getAllIdCards)
idCardRouter.get("/card/:cardId", verifyAccessToken ,protectedRoute, getSingleIdCard)

export default idCardRouter