import express from "express";
import { addNotice, deleteNotice, editNotice, getAllNotice, getSingleNotice } from "../Controllers/noticeControllers.js";
import { protectedRoute, verifyAuthToken } from "../middlewares/authMiddlewares.js";

const noticeRouter = express.Router()

noticeRouter.post('/addNotice' , verifyAuthToken , protectedRoute , addNotice)
noticeRouter.put('/editNotice/:noticeId' ,  verifyAuthToken ,protectedRoute , editNotice)
noticeRouter.delete('/deleteNotice/:noticeId' , verifyAuthToken ,protectedRoute , deleteNotice)
noticeRouter.get('/getAllNotices' , getAllNotice)
noticeRouter.get('/getNoticeById/:noticeId' , getSingleNotice)

export default noticeRouter