import express from "express";
import { createMembership , getAllMembers , getMembershipPlans , getUserMembership  } from "../Controllers/membershipControllers.js";
import { verifyAccessToken , protectedRoute } from "../middlewares/authMiddlewares.js";
const membershipRouter = express.Router();

membershipRouter.post("/create", verifyAccessToken, createMembership);
membershipRouter.get("/plans", verifyAccessToken, getMembershipPlans);
membershipRouter.get("/my-membership", verifyAccessToken, protectedRoute, getUserMembership);
membershipRouter.get("/all-members", verifyAccessToken, protectedRoute, getAllMembers);

export default membershipRouter;