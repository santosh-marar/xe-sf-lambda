import "dotenv/config"
import mongoose from "mongoose"
import { logger } from "../utils/logger"

const mongoUri = process.env.MONGODB_URI as string

if (!mongoUri) {
  throw new Error("MONGODB_URI is not defined in the environment variables")
}

const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoUri)
    // console.log("Connected to MongoDB")
    logger.info("Connected to MongoDB")
  } catch (error) {
    // console.error("Error connecting to MongoDB:", error)
    logger.error("Error connecting to MongoDB:", error)
    process.exit(1) // Exit the process with failure if connection fails
  }
}

export default connectToDatabase
