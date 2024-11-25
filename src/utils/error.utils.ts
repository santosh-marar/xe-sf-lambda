export default class CustomErrorHandler extends Error {
  public statusCode: number
  public success: boolean
  public errors?: string[] // Optional array to hold detailed errors (specifically for zod validation errors)

  constructor(statusCode: number, message: string, errors?: string[]) {
    super(message)
    this.statusCode = statusCode || 500
    this.success = false
    this.errors = errors // Optionally capture the errors array

    Error.captureStackTrace(this, this.constructor)
  }
}
