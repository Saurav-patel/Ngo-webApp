import express from 'express'
import dotenv from 'dotenv'
import dbConnect from './Database/dbconnect.js'
import cookieParser from 'cookie-parser'
import authRouter from './Routes/authRoutes.js'
import userRouter from './Routes/userRoutes.js'
import adminRouter from './Routes/adminRoutes.js'
import visitorRouter from './Routes/visitorRoutes.js'
import noticeRouter from './Routes/noticeRoutes.js'
const app = express()

dotenv.config()
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/user', userRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/visitor',visitorRouter)
app.use('api/v1/notice',noticeRouter)

app.get('/',(req,res) => {
    res.send("hello from the app")
})

const startServer = async() => {
    try {
        await dbConnect()
        app.listen(process.env.PORT,()=>{
            console.log(`App is running on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("Error in starting the server")
    }
}

startServer()