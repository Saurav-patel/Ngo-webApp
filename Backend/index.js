import express from "express";
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";

import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";
import { fileURLToPath } from "url";

import dbConnect from "./src/Database/dbconnect.js";

import authRouter from "./src/Modules/auth/authRoutes.js";
import userRouter from "./src/Modules/user/userRoutes.js";
import adminRouter from "./src/Modules/admin/adminRoutes.js";
import noticeRouter from "./src/Modules/notice/noticeRoutes.js";
import eventRouter from   "./src/Modules/events/eventRoutes.js";
import participationRouter from "./src/Modules/participation/participationRoutes.js";

import idCardRouter from "./src/Modules/idCard/idCardRoutes.js";
import certificateRouter from "./src/Modules/certificate/certificateRoutes.js";
import ngoRouter from "./src/Modules/ngo/ngoRoutes.js";
import contactRouter from "./src/Modules/contact/contactRoutes.js";

import { errorHandler } from "./src/middlewares/errorHandler.js";
import donationRouter from "./src/Modules/donation/donationRoutes.js";
import membershipRouter from "./src/Modules/membership/membershipRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

app.use(
  "/donation/webhook",
  express.raw({ type: "application/json" })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS Not Allowed: " + origin));
      }
    },
    credentials: true,
  })
);



app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);

app.use("/notice", noticeRouter);
app.use("/events", eventRouter);
app.use("/participation", participationRouter);

app.use("/idCards", idCardRouter);
app.use("/certificates", certificateRouter);
app.use("/ngo", ngoRouter);
app.use("/contact", contactRouter);
app.use("/donation", donationRouter);
app.use("/membership", membershipRouter);

app.get("/", (req, res) => {
  res.send("NGO backend is running");
});

app.use(errorHandler);

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await dbConnect();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
};

startServer();
