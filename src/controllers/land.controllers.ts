import { Request, Response } from "express"
import asyncMiddleware from "../middlewares/async.middlewares"
import Land from "../models/land.models"
import {
  createLandSchemaValidation,
  LandCreateType,
  LandUpdateType,
  updateLandSchemaValidation,
} from "../validators/land.validators"
import CustomErrorHandler from "../utils/error.utils"
import { USER_ROLES } from "../middlewares/auth.middlewares"
import { deleteMultipleFiles, generatePresignedPostUrls } from "../utils/s3-images.utils"

export const createLand = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req?.user?._id

  // Validate and parse incoming data
  const validatedData: LandCreateType = createLandSchemaValidation.parse({
    ...req.body,
    userId,
  })

  const newLand = await Land.create(validatedData)

  res.status(201).json({
    success: true,
    message: "Land created successfully",
    data: newLand,
  })
})

const allowedSortBy = ["fare", "createdAt"] as const
const allowedSortOrder = ["asc", "desc"] as const

type SortByType = (typeof allowedSortBy)[number]
type SortOrderType = (typeof allowedSortOrder)[number]

export const getAllLands = asyncMiddleware(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    minFare,
    maxFare,
    isAvailable,
    listingType,
    locationQuery,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query as Record<string, any>

  const filters: Record<string, any> = {}

  if (minFare) filters.fare = { $gte: Number(minFare) }
  if (maxFare) filters.fare = { ...filters.fare, $lte: Number(maxFare) }

  if (typeof isAvailable !== "undefined") filters.isAvailable = isAvailable === "true"
  if (listingType) filters.listingType = listingType

  if (locationQuery) {
    filters.$or = [
      { city: { $regex: locationQuery, $options: "i" } },
      { chowk: { $regex: locationQuery, $options: "i" } },
      { municipality: { $regex: locationQuery, $options: "i" } },
    ]
  }

  // Validate sortBy and sortOrder
  const finalSortBy: SortByType = allowedSortBy.includes(sortBy) ? sortBy : "createdAt"
  const finalSortOrder: SortOrderType = allowedSortOrder.includes(sortOrder) ? sortOrder : "desc"

  const sortOption: Record<string, 1 | -1> = {
    [finalSortBy]: finalSortOrder === "asc" ? 1 : -1,
  }

  const lands = await Land.paginate(filters, {
    page: Number(page),
    limit: Number(limit),
    sort: sortOption,
  })

  if (!lands || lands.docs.length === 0) {
    throw new CustomErrorHandler(404, "Lands not found")
  }

  return res.status(200).json({
    success: true,
    message: "Lands retrieved successfully",
    data: lands,
  })
})

export const getLandById = asyncMiddleware(async (req: Request, res: Response) => {
  const land = await Land.findById(req.params.id)
  if (!land) {
    return res.status(404).json({ success: false, message: "Land not found" })
  }
  return res.status(200).json({ success: true, message: "Land found successfully", data: land })
})

export const getMyLands = asyncMiddleware(async (req: Request, res: Response) => {
  const user = req.user
  const userId = user?._id

  if (!userId) throw new CustomErrorHandler(400, "User not found")

  // Get pagination parameters from query, with defaults
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 15

  const options = {
    page,
    limit,
    // select: "-sensitiveField", // Replace 'sensitiveField' with fields to exclude
    lean: true, // Use lean for performance
  }

  const result = await Land.paginate({ userId }, options)

  if (!result || result.docs.length === 0) {
    throw new CustomErrorHandler(404, "Lands not found")
  }

  res.json({
    success: true,
    message: "Found my lands successfully",
    data: result,
  })
})

export const updateLand = asyncMiddleware(async (req: Request, res: Response) => {
  const validatedData: LandUpdateType = updateLandSchemaValidation.parse({
    ...req.body,
    userId: req.user?._id,
  })

  const foundLand = await Land.findById(req.params.id)
  if (!foundLand) {
    throw new CustomErrorHandler(404, "Room not found")
  }

  // Check if the user is an admin or the owner of the address
  const isAdmin = req.user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundLand.userId.toString() === req.user?._id.toString()
  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  const land = await Land.findByIdAndUpdate(req.params.id, validatedData, { new: true, runValidators: true })

  if (!land) {
    return res.status(404).json({ success: false, message: "Land not found" })
  }
  return res.status(200).json({ success: true, message: "Land updated successfully", data: land })
})

export const deleteLand = asyncMiddleware(async (req: Request, res: Response) => {
  const foundLand = await Land.findById(req.params.id)
  if (!foundLand) {
    throw new CustomErrorHandler(404, "Land not found")
  }

  // Check if the user is an admin or the owner of the address
  const isAdmin = req.user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundLand.userId.toString() === req.user?._id.toString()
  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  // Ensure image is deleted
  if (foundLand?.spaceImagesUrl && foundLand?.spaceImagesUrl.length > 0) {
    const deleteImage = await deleteMultipleFiles(foundLand?.spaceImagesUrl)
  }

  const deletedLand = await Land.findByIdAndDelete(req.params.id)
  if (!deletedLand) {
    throw new CustomErrorHandler(404, "Land not found")
  }

  return res.status(200).json({ success: true, message: "Land deleted successfully" })
})

export const getPresignedPostUrls = asyncMiddleware(async (req: Request, res: Response) => {
  const { imageData } = req.body

  if (!imageData || !Array.isArray(imageData)) {
    return res.status(400).json({ error: "Invalid image data" })
  }

  const { presignedPosts, fileUrls } = await generatePresignedPostUrls("room-images", imageData)

  return res.status(200).json({
    presignedPosts,
    fileUrls,
  })
})
