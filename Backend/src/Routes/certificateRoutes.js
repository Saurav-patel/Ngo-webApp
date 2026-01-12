import express from "express";
import {issueCertificate , myCertificates , allCertificates , getSingleCertificate , deleteCertificate} from "../Controllers/certificateControllers.js";
import { protectedRoute } from "../middlewares/authMiddlewares.js";
import { verifyAccessToken } from "../middlewares/authMiddlewares.js";

const certificateRouter = express.Router();

certificateRouter.post('/issue-certificate', verifyAccessToken , issueCertificate)
certificateRouter.get('/my-certificates', verifyAccessToken ,myCertificates)
certificateRouter.get('/all-certificates', verifyAccessToken ,protectedRoute , allCertificates)
certificateRouter.get('/get-certificate/:certificateId', verifyAccessToken, protectedRoute , getSingleCertificate)
certificateRouter.delete('/delete-certificate/:certificateId', verifyAccessToken ,protectedRoute , deleteCertificate)
export default certificateRouter