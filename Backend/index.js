import express from 'express'
import dotenv from 'dotenv'
import dbConnect from './Database/dbconnect.js'
import cookieParser from 'cookie-parser'
import authRouter from './Routes/authRoutes.js'
const app = express()

dotenv.config()
app.use(cookieParser())


app.use('/api/v1/auth', authRouter)
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