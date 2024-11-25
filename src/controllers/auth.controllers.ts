import { Request, Response } from "express"
import asyncMiddleware from "../middlewares/async.middlewares"
import User from "../models/users.models"
import CustomErrorHandler from "../utils/error.utils"
import { sendRefreshAndAccessToken } from "../utils/jwt.utils"
import { userCreateSchema, UserCreateTypes } from "../validators/user.validators"
import bcrypt from "bcrypt"
import { loginSchema } from "../validators/auth.validators"
import jwt, { JwtPayload } from "jsonwebtoken"

// @desc Create a user
// @route POST /api/v1/auth/signup
// @access Public
export const createUser = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req?.user?._id

  const foundUser = await User.findById(userId)
  if (foundUser) {
    throw new CustomErrorHandler(400, "You already have an account")
  }

  const validatedData: UserCreateTypes = userCreateSchema.parse(req.body)

  const hashedPassword = await bcrypt.hash(validatedData.password, 10)

  // Create and save the new user
  const user = new User({
    ...validatedData,
    password: hashedPassword,
  })
  await user.save()

  sendRefreshAndAccessToken(user, res, "User created successfully", 201)
})

// @desc Login a user
// @route POST /api/v1/auth/login
// @access Public
export const loginUser = asyncMiddleware(async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body)

  const user = await User.findOne({
    $or: [{ email: validatedData.email }, { phoneNumber: validatedData.phoneNumber }],
  })
  if (!user) throw new CustomErrorHandler(400, "User not found")

  const isPasswordCorrect = await bcrypt.compare(validatedData.password, user.password)
  if (!isPasswordCorrect) {
    throw new CustomErrorHandler(400, "Invalid credentials")
  }

  sendRefreshAndAccessToken(user, res, "Login successful", 200)
})

// @desc Logout a user
// @route POST /api/v1/auth/logout
// @access Private (only accessible to authenticated users)
export const logoutUser = asyncMiddleware(async (req: Request, res: Response) => {
  
  res.clearCookie("jwtToken", {
    httpOnly: process.env.NODE_ENV !== "DEVELOPMENT",
    sameSite: process.env.NODE_ENV === "DEVELOPMENT" ? "lax" : "none",
    secure: process.env.NODE_ENV !== "DEVELOPMENT",
  })

  return res.status(200).json({
    success: true,
    message: "Logout successful",
    data: null,
  })
})


// @desc Refresh
// @route POST /refresh
// @access Public - because access token has expired
// Define a custom payload interface to ensure TypeScript recognizes 'user_id' and 'roles'
interface CustomJwtPayload extends JwtPayload {
  user_id: string;
  roles: string[]; // Adjust type if 'roles' is structured differently
}

export const refreshToken = asyncMiddleware(async (req, res, next) => {
  const { jwtToken } = req.cookies;
  
  if (!jwtToken) {
    return next(new CustomErrorHandler(401, "Please login first"));
  }

  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;

  jwt.verify(jwtToken, refreshTokenSecret, async (err: Error | null, decoded: JwtPayload | string | undefined) => {
    if (err) {
      return next(new CustomErrorHandler(403, "Forbidden"));
    }

    const payload = decoded as CustomJwtPayload;

    try {
      const foundUser = await User.findById(payload.user_id);

      if (!foundUser) {
        return next(new CustomErrorHandler(401, "Unauthorized"));
      }

      // Generate a new access token
      const accessToken = jwt.sign(
        {
          user_id: foundUser._id,
          roles: foundUser.roles,
        },
        accessTokenSecret,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    } catch (error) {
      next(error);
    }
  });
});