import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("DB is connected")
        
    } catch (error) {
        console.log("Error while connecting to the database")
        process.exit(1)
    }
}

export default dbConnect