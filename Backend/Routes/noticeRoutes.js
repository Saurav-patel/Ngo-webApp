import express from "express";
import { addNotice, deleteNotice, editNotice, getAllNotices, getNoticeById } from "../Controllers/noticeControllers.js";
import { protectedRoute } from "../utils/middlewares.js";

const noticeRouter = express.Router()

noticeRouter.post('/addNotice' , protectedRoute , addNotice)
noticeRouter.put('/editNotice/:noticeId' , protectedRoute , editNotice)
noticeRouter.delete('/deleteNotice/:noticeId' , protectedRoute , deleteNotice)
noticeRouter.get('/getAllNotices' , getAllNotices)
noticeRouter.get('/getNoticeById/:noticeId' , getNoticeById)

export default noticeRouter