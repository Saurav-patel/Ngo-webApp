import express from 'express';
import dotenv from 'dotenv';
dotenv.config()
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dbConnect from './Database/dbconnect.js';
import authRouter from './Routes/authRoutes.js';
import userRouter from './Routes/userRoutes.js';
import adminRouter from './Routes/adminRoutes.js';
import visitorRouter from './Routes/visitorRoutes.js';
import noticeRouter from './Routes/noticeRoutes.js';
import eventRouter from './Routes/eventRoutes.js';
import participationRouter from './Routes/participationRoutes.js';
import appointLetterRouter from './Routes/appointLetterRoutes.js';
import idCardRouter from './Routes/idCardRoutes.js';
import certificateRouter from './Routes/certificateRoutes.js';

const app = express()


app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors({
  origin: process.env.CLIENT_URL || '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true                     
}))


app.use('/api/v1/auth', authRouter)
app.use('/api/v1/user', userRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/visitor', visitorRouter)
app.use('/api/v1/notice', noticeRouter)
app.use('/api/v1/events', eventRouter)
app.use('/api/v1/participation',participationRouter)
app.use('/api/v1/appointments', appointLetterRouter)
app.use('/api/v1/idcards', idCardRouter)
app.use('/api/v1/certificates', certificateRouter)
app.get('/', (req, res) => {
  res.send("hello from the app")
})


const server = http.createServer(app)


export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
})


io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})


const startServer = async () => {
  try {
    await dbConnect();
    server.listen(process.env.PORT, () => {
      console.log(`App is running on port ${process.env.PORT}`)
    })
  } catch (error) {
    console.log("Error in starting the server:", error)
  }
}

startServer()
