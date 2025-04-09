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
import imageRoutes from "./routes/image.routes"

const app: Application = express()

// // Middleware
// app.use(express.json())
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://192.168.1.83:3000",
  "https://cityhom-com-frotnend.vercel.app",
  "https://www.cityhom.com",
].filter(Boolean) // Remove any undefined values

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true)

//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true)
//       }

//       const msg = `The CORS policy for this site does not allow access from ${origin}`
//       return callback(new Error(msg), false)
//     },
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//     preflightContinue: false,
//     optionsSuccessStatus: 204,
//   }),
// )

// // Handle preflight requests
// app.options("*", cors())

// Move this before defining any routes
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    const msg = `The CORS policy for this site does not allow access from ${origin}`
    return callback(new Error(msg), false)
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

app.options("*", cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images

// app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser() as express.RequestHandler)
app.use(limiter)

if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"))
}

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
app.use("/api/v1/images", imageRoutes)

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
// app.use(errorMiddleware) // Uncommented to handle errors

// Export the serverless handler
export const handler = serverless(app)
export default app
