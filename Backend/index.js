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
import authRouter from "./src/Routes/authRoutes.js";
import userRouter from "./src/Routes/userRoutes.js";
import adminRouter from "./src/Routes/adminRoutes.js";

import noticeRouter from "./src/Routes/noticeRoutes.js";
import eventRouter from "./src/Routes/eventRoutes.js";
import participationRouter from "./src/Routes/participationRoutes.js";
import appointLetterRouter from "./src/Routes/appointLetterRoutes.js";
import idCardRouter from "./src/Routes/idCardRoutes.js";
import certificateRouter from "./src/Routes/certificateRoutes.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import ngoRouter from "./src/Routes/ngoRoutes.js";
import contactRouter from "./src/Routes/contactRoutes.js";

const app = express();

// ---------- ES module __dirname setup ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Core middlewares ----------
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL, // e.g. http://localhost:5173
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ---------- Static files (logo, bg, img2, etc.) ----------
// This serves everything inside backend/public at the root URL.
// Example: backend/public/logo.png => http://localhost:PORT/logo.png
app.use(express.static(path.join(__dirname, "public")));

// ---------- API routes ----------
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);

app.use("/api/v1/notice", noticeRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/participation", participationRouter);
app.use("/api/v1/appointments", appointLetterRouter);
app.use("/api/v1/idCards", idCardRouter);
app.use("/api/v1/certificates", certificateRouter);
app.use("/api/v1/ngo", ngoRouter);
app.use("/api/v1/contact",contactRouter)

app.get("/", (req, res) => {
  res.send("hello from the app");
});

// ---------- Error handler ----------
app.use(errorHandler);

// ---------- HTTP + Socket.io server ----------
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ---------- Start server ----------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await dbConnect();
    server.listen(PORT, () => {
      console.log(`App is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Error in starting the server:", error);
  }
};

startServer();
