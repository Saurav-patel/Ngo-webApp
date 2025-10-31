import express from "express";
import {issueCertificate , myCertificates , allCertificates , getSingleCertificate , deleteCertificate} from "../Controllers/certificateControllers.js";
import { protectedRoute } from "../utils/middlewares.js";
import { verifyAccessToken } from "../utils/middlewares.js";

const certificateRouter = express.Router();

certificateRouter.post('/issue-certificate/', verifyAccessToken , issueCertificate)
certificateRouter.get('/my-certificates/:userId', verifyAccessToken ,myCertificates)
certificateRouter.get('/all-certificates', protectedRoute , allCertificates)
certificateRouter.get('/get-certificate/:certificateId', protectedRoute , getSingleCertificate)
certificateRouter.delete('/delete-certificate/:certificateId', protectedRoute , deleteCertificate)
export default certificateRouter