import { Request, Response, NextFunction } from "express"
import asyncMiddleware from "../middlewares/async.middlewares"
import Apartment from "../models/apartment.models"
import CustomErrorHandler from "../utils/error.utils"
import {
  apartmentZodSchema,
  apartmentUpdateSchema,
  ApartmentCreateTypes,
  ApartmentUpdateTypes,
} from "../validators/apartment.validators"
import { USER_ROLES } from "../middlewares/auth.middlewares"
import { deleteMultipleFiles, generatePresignedPostUrls } from "../utils/s3-images.utils"

// @desc    Create a new apartment
// @route   POST /api/v1/apartments
// @access  Private (only accessible to space_providers,brokers and admins)
export const createApartment = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req?.user?._id

  // Validate and parse incoming data
  const validatedData: ApartmentCreateTypes = apartmentZodSchema.parse({
    ...req.body,
    userId,
  })

  const newApartment = await Apartment.create(validatedData)

  res.status(201).json({
    success: true,
    message: "Apartment created successfully",
    data: newApartment,
  })
})

// @desc    Get all apartments
// @route   GET /api/v1/apartments
// @access  Public
export const getAllApartments = asyncMiddleware(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    fareMin,
    fareMax,
    city,
    isAvailable,
    isActive,
    genderPreference,
    listingType,
    nearPopularPlaceName,
    chowk,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query

  // Initialize filters with partial matching setup
  const filters: any = {}

  // Fare filtering
  if (fareMin) filters.fare = { $gte: Number(fareMin) }
  if (fareMax) filters.fare = { ...filters.fare, $lte: Number(fareMax) }

  // Partial match filters
  if (city) filters.city = { $regex: city as string, $options: "i" }
  if (chowk) filters.chowk = { $regex: chowk as string, $options: "i" }
  if (nearPopularPlaceName) filters.nearPopularPlaceName = { $regex: nearPopularPlaceName as string, $options: "i" }

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

  // Paginate and retrieve apartments
  const apartments = await Apartment.paginate(filters, {
    page: Number(page),
    limit: Number(limit),
    sort: sortOption,
  })

  if (!apartments || apartments.length === 0) {
    throw new CustomErrorHandler(404, "Apartments not found")
  }

  return res.status(200).json({
    success: true,
    message: "Apartments retrieved successfully",
    data: apartments,
  })
})

// @desc    Get a single apartment
// @route   GET /api/v1/apartments/:id
// @access  Public
export const getApartmentById = asyncMiddleware(async (req: Request, res: Response) => {
  const foundApartment = await Apartment.findById(req.params.id).select("-__v")

  if (!foundApartment) {
    throw new CustomErrorHandler(404, "Apartment not found")
  }

  return res.status(200).json({
    success: true,
    message: "Apartment found successfully",
    data: foundApartment,
  })
})

// @desc    Update a apartment
// @route   PUT /api/v1/apartments/:id
// @access  Private (only accessible to their owners & admins)
export const updateApartment = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req?.user?._id

  // Validate and parse incoming data
  const validatedData: ApartmentUpdateTypes = apartmentUpdateSchema.parse({
    ...req.body,
    userId,
  })

  const foundApartment = await Apartment.findById(req.params.id)

  if (!foundApartment) {
    throw new CustomErrorHandler(404, "Apartment not found")
  }

  // Check if the user is an admin or the owner of the address
  const isAdmin = req.user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundApartment.userId.toString() === req.user?._id.toString()
  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  const updatedApartment = await Apartment.findByIdAndUpdate(req.params.id, validatedData, {
    new: true,
    runValidators: true,
  })

  return res.status(200).json({
    success: true,
    message: "Apartment updated successfully",
    data: updatedApartment,
  })
})

// @desc    Delete a apartment
// @route   DELETE /api/v1/apartments/:id
// @access  Private (only accessible to their owners & admins)
export const deleteApartment = asyncMiddleware(async (req: Request, res: Response) => {
  const foundApartment = await Apartment.findById(req.params.id)
  if (!foundApartment) return res.status(404).json({ message: "Apartment not found" })

  // Check if the user is an admin or the owner of the address
  const isAdmin = req.user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundApartment.userId.toString() === req.user?._id.toString()
  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  // Ensure imageData is provided
  if (foundApartment?.spaceImagesUrl && foundApartment?.spaceImagesUrl.length > 0) {
    const deleteImage: void = await deleteMultipleFiles(foundApartment?.spaceImagesUrl)
  }

  const deletedApartment = await Apartment.findByIdAndDelete(req.params.id)
  if (!deletedApartment) throw new CustomErrorHandler(404, "Apartment not found")

  return res.status(200).json({
    success: true,
    message: "Apartment deleted successfully",
    data: deletedApartment,
  })
})

// @desc Get my apartments
// @route   GET /api/v1/apartments/my-apartments
// @access  Private
export const getMyAllApartments = asyncMiddleware(async (req: Request, res: Response) => {
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

  const result = await Apartment.paginate({ userId }, options)

  if (!result || result.docs.length === 0) {
    throw new CustomErrorHandler(404, "Rooms not found")
  }

  res.json({
    success: true,
    message: "Found my rooms successfully",
    data: result,
  })
})

// @desc Get signedUrl for apartments images
// @route   GET /api/v1/apartments/get-signed-url
// @access  Authenticated user only
export const getSignedUrlForApartmentImages = asyncMiddleware(async (req: Request, res: Response) => {
  const { imageData } = req.body

  if (!imageData || !Array.isArray(imageData)) {
    return res.status(400).json({ error: "Invalid image data" })
  }

  const { presignedPosts, fileUrls } = await generatePresignedPostUrls("apartment-images", imageData)

  return res.status(200).json({
    presignedPosts,
    fileUrls,
  })
})
