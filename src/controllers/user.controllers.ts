import { Request, Response } from "express"
import User from "../models/users.models"
import { userUpdateSchema, UserUpdateTypes } from "../validators/user.validators"
import asyncMiddleware from "../middlewares/async.middlewares"
import CustomErrorHandler from "../utils/error.utils"
import { USER_ROLES } from "../middlewares/auth.middlewares"
import { generatePresignedUrl } from "../utils/s3-images.utils"
import Room from "../models/room.models"

// @desc Get a user by ID
// @route GET /api/v1/users/:id
// @access Private (only accessible to the owner of the user) & Admin
export const getUserById = asyncMiddleware(async (req: Request, res: Response) => {
  const foundUser = await User.findById(req.params.id).select("-password -roles -__v")

  if (!foundUser) {
    throw new CustomErrorHandler(404, "User not found")
  }

  const user = req.user
  const isAdmin = user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundUser?._id?.toString() === user?._id.toString()

  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  return res.status(200).json({
    success: true,
    message: "User found successfully",
    data: foundUser,
  })
})

// @desc Update a user by ID
// @route POST /api/v1/users/:id
// @access Private (only accessible to the owner of the user) & Admin
export const updateUser = asyncMiddleware(async (req: Request, res: Response) => {
  const validatedData: UserUpdateTypes = userUpdateSchema.parse(req.body)

  const foundUser = await User.findById(req.params.id)
  if (!foundUser) {
    throw new CustomErrorHandler(404, "User not found")
  }

  // Check if the user is an admin or the owner of the user
  const isAdmin = req.user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundUser?._id?.toString() === req.user?._id.toString()
  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, validatedData, {
    new: true,
    runValidators: true,
  }).select("-password -roles -__v")

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  })
})

// @desc Delete a user by ID
// @route Delete /api/v1/users/:id
// @access Private (only accessible to the owner of the user) & Admin
export const deleteUser = asyncMiddleware(async (req: Request, res: Response) => {
  const foundUser = await User.findById(req.params.id)
  if (!foundUser) throw new CustomErrorHandler(404, "User not found")

  // Type checking for roles array
  const userRoles = foundUser.roles as USER_ROLES[]
  if (userRoles?.includes(USER_ROLES.SUPER_ADMIN) || userRoles?.includes(USER_ROLES.ADMIN)) {
    throw new CustomErrorHandler(403, "Forbidden: Cannot delete admin or super admin users")
  }

  // Check if the requesting user is an admin or the owner of the user
  const requestUserRoles = req.user?.roles as USER_ROLES[]
  const isAdmin = requestUserRoles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundUser?._id?.toString() === req.user?._id.toString()
  const isSuperAdmin = requestUserRoles?.includes(USER_ROLES.SUPER_ADMIN)

  if (!isAdmin && !isOwner && !isSuperAdmin) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  const deletedUser = await User.findByIdAndDelete(req.params.id).select("-password -roles -__v")
  const deleteRooms = await Room.deleteMany({ userId: req.params.id })
  if (!deletedUser) throw new CustomErrorHandler(404, "User not found")

  return res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: deletedUser,
  })
})

// @desc Get signedUrl for room images
// @route   GET /api/v1/users/get-signed-url
// @access  Authenticated user only
export const getPresignedUrlForUserAvatar = asyncMiddleware(async (req: Request, res: Response) => {
  const { imageData } = req.body

  // Ensure imageData is provided
  if (!imageData || imageData.length === 0) {
    throw new CustomErrorHandler(400, "No image data provided")
  }

  // Generate presigned URLs
  const signedUrls = await generatePresignedUrl("user-avatar", imageData)

  // Extract base URLs by removing query parameters
  const extractedBaseUrls = signedUrls?.split("?")[0]

  // Send the extracted base URLs and presigned URLs in the response
  return res.json({
    imageUrls: extractedBaseUrls,
    imagePreSignedUrls: signedUrls,
  })
})
