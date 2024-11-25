import "dotenv/config"
import app from "./app"
import connectToDatabase from "./configs/database.configs"
import { logger } from "./utils/logger"

const PORT = process.env.PORT || 8000

// Start the server and connect to the database
const startServer = async () => {
  await connectToDatabase()

  app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`)
  })
}

startServer()
