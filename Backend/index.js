import express from 'express';
import dotenv from 'dotenv';
dotenv.config()
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dbConnect from './src/Database/dbconnect.js';
import authRouter from './src/Routes/authRoutes.js';
import userRouter from './src/Routes/userRoutes.js';
import adminRouter from './src/Routes/adminRoutes.js';
import visitorRouter from './src/Routes/visitorRoutes.js';
import noticeRouter from './src/Routes/noticeRoutes.js';
import eventRouter from './src/Routes/eventRoutes.js';
import participationRouter from './src/Routes/participationRoutes.js';
import appointLetterRouter from './src/Routes/appointLetterRoutes.js';
import idCardRouter from './src/Routes/idCardRoutes.js';
import certificateRouter from './src/Routes/certificateRoutes.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import ngoRouter from './src/Routes/ngoRoutes.js';

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
app.use('/api/v1/ngo', ngoRouter)
app.get('/', (req, res) => {
  res.send("hello from the app")
})

app.use(errorHandler)
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
