import { Request, Response, NextFunction } from "express"
import asyncMiddleware from "../middlewares/async.middlewares"
import Flat from "../models/flat.models"
import CustomErrorHandler from "../utils/error.utils"
import { flatZodSchema, flatUpdateSchema, FlatCreateTypes, FlatUpdateTypes } from "../validators/flat.validators"
import { USER_ROLES } from "../middlewares/auth.middlewares"
import { deleteMultipleFiles, generatePresignedPostUrls } from "../utils/s3-images.utils"

// @desc    Create a new flat
// @route   POST /api/v1/flats
// @access  Private (only accessible to space_providers,brokers and admins)
export const createFlat = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req?.user?._id

  // Validate and parse incoming data
  const validatedData: FlatCreateTypes = flatZodSchema.parse({
    ...req.body,
    userId,
  })

  const newFlat = await Flat.create(validatedData)

  res.status(201).json({
    success: true,
    message: "Flat created successfully",
    data: newFlat,
  })
})

// @desc    Get all flats
// @route   GET /api/v1/flats
// @access  Public
export const getAllFlats = asyncMiddleware(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    fareMin,
    fareMax,
    isAvailable,
    isActive,
    genderPreference,
    listingType,
    locationQuery,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query

  // Initialize filters with partial matching setup
  const filters: any = {}

  // Fare filtering
  if (fareMin) filters.fare = { $gte: Number(fareMin) }
  if (fareMax) filters.fare = { ...filters.fare, $lte: Number(fareMax) }

  // Partial match filters
  if (locationQuery) {
    filters.$or = [
      { city: { $regex: locationQuery as string, $options: "i" } },
      { chowk: { $regex: locationQuery as string, $options: "i" } },
      { nearPopularPlaceName: { $regex: locationQuery as string, $options: "i" } },
    ]
  }

  // Other filters
  if (isAvailable) filters.isAvailable = isAvailable === "true"
  if (isActive) filters.isActive = isActive === "true"
  if (genderPreference) filters.genderPreference = genderPreference as string
  if (listingType) filters.listingType = listingType as string
  // Sorting options
  let sortOption
  switch (sortBy) {
    case "fare":
      sortOption = { fare: sortOrder === "asc" ? 1 : -1 }
      break
    case "createdAt":
    default:
      sortOption = { createdAt: sortOrder === "asc" ? 1 : -1 }
      break
  }

  // Paginate and retrieve flats
  const flats = await Flat.paginate(filters, {
    page: Number(page),
    limit: Number(limit),
    sort: sortOption,
  })

  if (!flats || flats.length === 0) {
    throw new CustomErrorHandler(404, "Flats not found")
  }

  return res.status(200).json({
    success: true,
    message: "Flats retrieved successfully",
    data: flats,
  })
})

// @desc    Get a single flat
// @route   GET /api/v1/flats/:id
// @access  Public
export const getFlatById = asyncMiddleware(async (req: Request, res: Response) => {
  const foundFlat = await Flat.findById(req.params.id).select("-__v")

  if (!foundFlat) {
    throw new CustomErrorHandler(404, "Flat not found")
  }

  return res.status(200).json({
    success: true,
    message: "Flat found successfully",
    data: foundFlat,
  })
})

// @desc    Update a flat
// @route   PUT /api/v1/flats/:id
// @access  Private (only accessible to their owners & admins)
export const updateFlat = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req?.user?._id

  // Validate and parse incoming data
  const validatedData: FlatUpdateTypes = flatUpdateSchema.parse({
    ...req.body,
    userId,
  })

  const foundFlat = await Flat.findById(req.params.id)

  if (!foundFlat) {
    throw new CustomErrorHandler(404, "Flat not found")
  }

  // Check if the user is an admin or the owner of the address
  const isAdmin = req.user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundFlat.userId.toString() === req.user?._id.toString()
  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  const updatedFlat = await Flat.findByIdAndUpdate(req.params.id, validatedData, {
    new: true,
    runValidators: true,
  })

  return res.status(200).json({
    success: true,
    message: "Flat updated successfully",
    data: updatedFlat,
  })
})

// @desc    Delete a flat
// @route   DELETE /api/v1/flats/:id
// @access  Private (only accessible to their owners & admins)
export const deleteFlat = asyncMiddleware(async (req: Request, res: Response) => {
  const foundFlat = await Flat.findById(req.params.id)
  if (!foundFlat) return res.status(404).json({ message: "Flat not found" })

  // Check if the user is an admin or the owner of the address
  const isAdmin = req.user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundFlat.userId.toString() === req.user?._id.toString()
  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  // Ensure imageData is provided
  if (foundFlat?.spaceImagesUrl && foundFlat?.spaceImagesUrl.length > 0) {
    const deleteImage: void = await deleteMultipleFiles(foundFlat?.spaceImagesUrl)
  }

  const deletedFlat = await Flat.findByIdAndDelete(req.params.id)
  if (!deletedFlat) throw new CustomErrorHandler(404, "Flat not found")

  return res.status(200).json({
    success: true,
    message: "Flat deleted successfully",
    data: deletedFlat,
  })
})

// @desc Get my flats
// @route   GET /api/v1/flats/my-flats
// @access  Private
export const getMyAllFlats = asyncMiddleware(async (req: Request, res: Response) => {
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

  const result = await Flat.paginate({ userId }, options)

  if (!result || result.docs.length === 0) {
    throw new CustomErrorHandler(404, "Rooms not found")
  }

  res.json({
    success: true,
    message: "Found my rooms successfully",
    data: result,
  })
})

// @desc Get signedUrl for flats images
// @route   GET /api/v1/flats/get-signed-url
// @access  Authenticated user only
export const getSignedUrlForFlatImages = asyncMiddleware(async (req: Request, res: Response) => {
  const { imageData } = req.body

  if (!imageData || !Array.isArray(imageData)) {
    return res.status(400).json({ error: "Invalid image data" })
  }

  const { presignedPosts, fileUrls } = await generatePresignedPostUrls("flat-images", imageData)

  return res.status(200).json({
    presignedPosts,
    fileUrls,
  })
})
