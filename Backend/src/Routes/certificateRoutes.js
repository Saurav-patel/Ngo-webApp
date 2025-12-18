import express from "express";
import {issueCertificate , myCertificates , allCertificates , getSingleCertificate , deleteCertificate} from "../Controllers/certificateControllers.js";
import { protectedRoute } from "../middlewares/authMiddlewares.js";
import { verifyAuthToken } from "../middlewares/authMiddlewares.js";

const certificateRouter = express.Router();

certificateRouter.post('/issue-certificate', verifyAuthToken , issueCertificate)
certificateRouter.get('/my-certificates', verifyAuthToken ,myCertificates)
certificateRouter.get('/all-certificates', verifyAuthToken ,protectedRoute , allCertificates)
certificateRouter.get('/get-certificate/:certificateId', verifyAuthToken, protectedRoute , getSingleCertificate)
certificateRouter.delete('/delete-certificate/:certificateId', verifyAuthToken ,protectedRoute , deleteCertificate)
export default certificateRouter