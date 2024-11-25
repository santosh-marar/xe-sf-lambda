import { Response } from "express"
import jwt from "jsonwebtoken"

/**
 * Sends refresh and access tokens to the client.
 *
 * @param user - The user object (must contain `_id` and `roles`).
 * @param res - The Express Response object.
 * @param message - A message to include in the response.
 * @param statusCode - HTTP status code for the response (default is 200).
 * @returns The Express Response object.
 */
export const sendRefreshAndAccessToken = (
  user: any,
  res: Response,
  message: string,
  statusCode: number = 200,
): Response => {
  // Generate Access Token (short-lived)
  const accessToken = jwt.sign({ user_id: user._id, roles: user.roles }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  })

  // Generate Refresh Token (long-lived)
  const refreshToken = jwt.sign({ user_id: user._id, roles: user.roles }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "90d",
  })

  // Set the refresh token as a cookie
  res.cookie("jwtToken", refreshToken, {
    httpOnly: true,
    maxAge: 90 * 24 * 60 * 60 * 1000,
    sameSite: "none", // Required for cross-site requests
    secure: process.env.NODE_ENV !== "dev", // Use Secure only in production (HTTPS)
  })

  // Return response with the access token
  return res.status(statusCode).json({
    success: true,
    message,
    accessToken,
  })
}
