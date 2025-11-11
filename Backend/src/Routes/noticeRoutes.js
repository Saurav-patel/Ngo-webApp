import express from "express";
import { addNotice, deleteNotice, editNotice, getAllNotice, getSingleNotice } from "../Controllers/noticeControllers.js";
import { protectedRoute, verifyAccessToken } from "../middlewares/authMiddlewares.js";

const noticeRouter = express.Router()

noticeRouter.post('/addNotice' , verifyAccessToken , protectedRoute , addNotice)
noticeRouter.put('/editNotice/:noticeId' , verifyAccessToken ,protectedRoute , editNotice)
noticeRouter.delete('/deleteNotice/:noticeId' , verifyAccessToken ,protectedRoute , deleteNotice)
noticeRouter.get('/getAllNotices' , getAllNotice)
noticeRouter.get('/getNoticeById/:noticeId' , getSingleNotice)

export default noticeRouter