import { Request, Response, NextFunction } from "express"
import CustomErrorHandler from "../utils/error.utils"
import { ZodError } from "zod"

export default function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Default error properties
  let customError = err

  // Check if the error is a Zod validation error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(
      (e) => `${e.path.join(".")}: ${e.message}`,
    )
    customError = new CustomErrorHandler(
      400,
      "Validation Error",
      formattedErrors,
    )
  }

  // Handle MongoDB "CastError" (invalid ObjectId)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`
    customError = new CustomErrorHandler(400, message)
  }

  // Handle MongoDB duplicate key errors (e.g., unique fields like email/phone)
  if (err.code === 11000) {
    const fieldName = Object.keys(err.keyValue)[0]
    const message =
      fieldName === "email"
        ? "Email address is already in use"
        : fieldName === "phone"
          ? "Phone number is already in use"
          : "Duplicate field value"

    customError = new CustomErrorHandler(409, message)
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    customError = new CustomErrorHandler(400, "Invalid JSON Web Token")
  }

  // Handle expired JWT token errors
  if (err.name === "TokenExpiredError") {
    customError = new CustomErrorHandler(401, "Unauthorized: Token expired")
  }

  // If the error is not an instance of CustomErrorHandler, set it as an internal server error
  if (!(customError instanceof CustomErrorHandler)) {
    customError = new CustomErrorHandler(500, "Internal Server Error")
  }

  // Send the response
  res.status(customError.statusCode).json({
    success: false,
    message: customError.message,
    errors: customError.errors || undefined, // Include the Zod validation errors if present
  })
}
