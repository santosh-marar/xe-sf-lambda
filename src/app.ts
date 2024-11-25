import express, { Application, Request, Response } from "express"
import serverless from "serverless-http"
import errorMiddleware from "./middlewares/error.middlewares"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import connectToDatabase from "./configs/database.configs"
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import addressRoutes from "./routes/address.routes"
import roomRoutes from "./routes/room.routes"
import apartmentRoutes from "./routes/apartment.routes"
import { limiter } from "./utils/rate.limit.utils"
import searchRoutes from "./routes/search.routes"
import adminRoutes from "./routes/admin.routes"

const app: Application = express()

// Middleware
app.use(express.json())
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL as string,
      "http://localhost:3000",
      "http://localhost:5173",
      "http://192.168.1.83:3000",
      "192.168.1.83:3000",
      "https://cityhom-com-frotnend.vercel.app",
      "https://www.cityhom.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
)
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser() as express.RequestHandler)
app.use(limiter)

if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"))
}

app.use(morgan("dev"))

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!")
})

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/addresses", addressRoutes)
app.use("/api/v1/rooms", roomRoutes)
app.use("/api/v1/apartments", apartmentRoutes)
app.use("/api/v1/spaces", searchRoutes)
app.use("/api/v1/admin", adminRoutes)

// Connect to database before initializing server
;(async () => {
  try {
    await connectToDatabase()
  } catch (error) {
    console.error("Database connection error:", error)
    process.exit(1) // Exit if unable to connect to the database
  }
})()

// Error middleware
app.use(errorMiddleware) // Uncommented to handle errors

// Export the serverless handler
export const handler = serverless(app)
export default app
