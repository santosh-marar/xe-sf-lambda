import "dotenv/config"

export const envConfig = {
  MONGODB_URI: process.env.MONGODB_URI || "",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  RATE_LIMIT_WINDOW_MINUTES: process.env.RATE_LIMIT_WINDOW_MINUTES || 10,
  PORT: process.env.PORT || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // File upload
  FILE_UPLOAD_MAX_FILES: process.env.FILE_UPLOAD_MAX_FILES || 10,
  FILE_UPLOAD_MAX_SIZE: process.env.FILE_UPLOAD_MAX_SIZE || 1024 * 1024 * 10, // 10MB
  FILE_UPLOAD_ALLOWED_TYPES: process.env.FILE_UPLOAD_ALLOWED_TYPES || "image/jpeg,image/png,image/gif",
  FILE_UPLOAD_MIN_FILES: process.env.FILE_UPLOAD_MIN_FILES || 0,


  // Image upload
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID ,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME
}

// Validate required environment variables
export const validateEnv = () => {
  const required = ["MONGODB_URI", "ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET","CLOUDFLARE_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"]
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}

// import * as dotenv from "dotenv"
// import { z } from "zod"

// // Load .env file
// dotenv.config()

// const envSchema = z.object({
//   NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
//   PORT: z.string().default("3000"),
//   DATABASE_URL: z.string().url(),
//   AWS_ACCESS_KEY_ID: z.string(),
//   AWS_SECRET_ACCESS_KEY: z.string(),
//   S3_BUCKET_NAME: z.string(),
// })

// const parsedEnv = envSchema.safeParse(process.env)

// if (!parsedEnv.success) {
//   console.error("Invalid environment variables:", parsedEnv.error.format())
//   process.exit(1) // Exit if env variables are invalid
// }

// export const ENV = parsedEnv.data
