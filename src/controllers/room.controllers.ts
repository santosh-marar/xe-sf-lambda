import { Request, Response, NextFunction } from "express"
import asyncMiddleware from "../middlewares/async.middlewares"
import Room from "../models/room.models"
import CustomErrorHandler from "../utils/error.utils"
import {
  roomCreateSchemaValidation,
  RoomCreateTypes,
  roomUpdateSchema,
  RoomUpdateTypes,
} from "../validators/room.validators"
import { USER_ROLES } from "../middlewares/auth.middlewares"
import Apartment from "../models/apartment.models"
import { deleteMultipleFiles, generatePresignedPostUrls } from "../utils/s3-images.utils"

// @desc    Create a new room
// @route   POST /api/v1/rooms
// @access  Private (only accessible to space_providers,brokers and admins)
export const createRoom = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req?.user?._id

  // Validate and parse incoming data
  const validatedData: RoomCreateTypes = roomCreateSchemaValidation.parse({
    ...req.body,
    userId,
  })

  const newRoom = await Room.create(validatedData)

  res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: newRoom,
  })
})

// @desc    Get all rooms
// @route   GET /api/v1/rooms
// @access  Public
export const getAllRooms = asyncMiddleware(async (req: Request, res: Response) => {
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

  // Paginate and retrieve rooms
  const rooms = await Room.paginate(filters, {
    page: Number(page),
    limit: Number(limit),
    sort: sortOption,
  })

  if (!rooms || rooms.length === 0) {
    throw new CustomErrorHandler(404, "Rooms not found")
  }

  return res.status(200).json({
    success: true,
    message: "Rooms retrieved successfully",
    data: rooms,
  })
})

// @desc    Get a single room
// @route   GET /api/v1/rooms/:id
// @access  Public
export const getRoomById = asyncMiddleware(async (req: Request, res: Response) => {
  const foundRoom = await Room.findById(req.params.id).select("-__v")

  if (!foundRoom) {
    throw new CustomErrorHandler(404, "Room not found")
  }

  return res.status(200).json({
    success: true,
    message: "Room found successfully",
    data: foundRoom,
  })
})

// @desc    Update a room
// @route   PUT /api/v1/rooms/:id
// @access  Private (only accessible to their owners & admins)
export const updateRoom = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req?.user?._id

  // Validate and parse incoming data
  const validatedData: RoomUpdateTypes = roomUpdateSchema.parse({
    ...req.body,
    userId,
  })

  const foundRoom = await Room.findById(req.params.id)

  if (!foundRoom) {
    throw new CustomErrorHandler(404, "Room not found")
  }

  // Check if the user is an admin or the owner of the address
  const isAdmin = req.user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundRoom.userId.toString() === req.user?._id.toString()
  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  const updatedRoom = await Room.findByIdAndUpdate(req.params.id, validatedData, {
    new: true,
    runValidators: true,
  })

  return res.status(200).json({
    success: true,
    message: "Room updated successfully",
    data: updatedRoom,
  })
})

// @desc    Delete a room
// @route   DELETE /api/v1/rooms/:id
// @access  Private (only accessible to their owners & admins)
export const deleteRoom = asyncMiddleware(async (req: Request, res: Response) => {
  const foundRoom = await Room.findById(req.params.id)
  if (!foundRoom) return res.status(404).json({ message: "Room not found" })

  // Check if the user is an admin or the owner of the address
  const isAdmin = req.user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundRoom.userId.toString() === req.user?._id.toString()
  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  // Ensure imageData is provided
  if (foundRoom?.spaceImagesUrl && foundRoom?.spaceImagesUrl.length > 0) {
    const deleteImage = await deleteMultipleFiles(foundRoom?.spaceImagesUrl)
  }

  const deletedRoom = await Room.findByIdAndDelete(req.params.id)
  if (!deletedRoom) throw new CustomErrorHandler(404, "Room not found")

  return res.status(200).json({
    success: true,
    message: "Room deleted successfully",
    data: deletedRoom,
  })
})

// @desc Get signedUrl for room images
// @route   GET /api/v1/rooms/get-signed-url
// @access  Authenticated user only
export const getPresignedUrls = asyncMiddleware(async (req: Request, res: Response) => {
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

// @desc Get my rooms
// @route   GET /api/v1/rooms/my-rooms
// @access  Private
export const getMyAllRooms = asyncMiddleware(async (req: Request, res: Response) => {
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

  const result = await Room.paginate({ userId }, options)

  if (!result || result.docs.length === 0) {
    throw new CustomErrorHandler(404, "Rooms not found")
  }

  res.json({
    success: true,
    message: "Found my rooms successfully",
    data: result,
  })
})

// @desc Unified Search API with filters and pagination
// @route   GET /api/v1/spaces/search
// @access  Public
export const getSpaces = asyncMiddleware(async (req: Request, res: Response) => {
  const {
    spaceCategories,
    locationQuery,
    minFare = 0,
    maxFare = Number.MAX_SAFE_INTEGER,
    genderPreference,
    isSpaceProviderLiving,
    sortBy = "createdAt",
    sortOrder = "desc",
    minBedrooms,
    limit = 10,
    page = 1,
  } = req.query

  let sortOption: any
  switch (sortBy) {
    case "fare":
      sortOption = { fare: sortOrder === "asc" ? 1 : -1 }
      break
    case "createdAt":
    default:
      sortOption = { createdAt: sortOrder === "asc" ? 1 : -1 }
      break
  }

  const matchStage: any = {
    fare: {
      $gte: parseInt(minFare as string, 10),
      $lte: parseInt(maxFare as string, 10),
    },
    ...(req.query.isAvailable !== undefined && {
      isAvailable: req.query.isAvailable === "true" ? true : req.query.isAvailable === "false" ? false : null,
    }),
    ...(genderPreference && { genderPreference }),
    ...(isSpaceProviderLiving !== undefined && { isSpaceProviderLiving: isSpaceProviderLiving === "true" }),
  }

  if (locationQuery) {
    matchStage.$or = [
      { city: { $regex: locationQuery as string, $options: "i" } },
      { chowk: { $regex: locationQuery as string, $options: "i" } },
    ]
  }

  // Add spaceCategories filter if provided
  if (spaceCategories) {
    matchStage.spaceCategories = spaceCategories
  }

  const apartmentMatch = {
    ...matchStage,
    ...(minBedrooms && { noOfBedrooms: { $gte: parseInt(minBedrooms as string) } }),
  }
  const roomMatch = matchStage

  const apartmentResults = Apartment.aggregate([
    { $match: apartmentMatch },
    { $sort: sortOption },
    {
      $project: {
        spaceCategories: "apartment",
        city: 1,
        chowk: 1,
        fare: 1,
        createdAt: 1,
        genderPreference: 1,
        isSpaceProviderLiving: 1,
        spaceImagesUrl: 1,
        descriptionOfSpace: 1,
        nearPopularPlace: 1,
        isAvailable: 1,
      },
    },
  ])

  const roomResults = Room.aggregate([
    { $match: roomMatch },
    { $sort: sortOption },
    {
      $project: {
        spaceCategories: "room",
        city: 1,
        chowk: 1,
        fare: 1,
        createdAt: 1,
        genderPreference: 1,
        isSpaceProviderLiving: 1,
        spaceImagesUrl: 1,
        descriptionOfSpace: 1,
        nearPopularPlace: 1,
        isAvailable: 1,
      },
    },
  ])

  // const landResults = Land.aggregate([
  //   { $match: matchStage },
  //   { $sort: sortOption },
  //   {
  //     $project: {
  //       spaceCategories: "land",
  //       city: 1,
  //       chowk: 1,
  //       fare: 1,
  //       facility: 1,
  //       description: 1,
  //       createdAt: 1,
  //       genderPreference: 1,
  //       isSpaceProviderLiving: 1,
  //     },
  //   },
  // ])

  // add lands
  const [apartments, rooms] = await Promise.all([apartmentResults, roomResults])

  // Combine the results from all property types
  // add ...lands if you add land property
  const combinedResults = [...apartments, ...rooms].sort((a, b) => {
    return sortOption.fare
      ? sortOption.fare * (a.fare - b.fare)
      : sortOption.createdAt * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  })

  const totalDocs = combinedResults.length
  const totalPages = Math.ceil(totalDocs / parseInt(limit as string))
  const paginatedResults = combinedResults.slice(
    (parseInt(page as string) - 1) * parseInt(limit as string),
    parseInt(page as string) * parseInt(limit as string),
  )
  const hasPrevPage = parseInt(page as string) > 1
  const hasNextPage = parseInt(page as string) < totalPages

  res.json({
    results: paginatedResults,
    totalDocs,
    limit: parseInt(limit as string),
    totalPages,
    page: parseInt(page as string),
    pagingCounter: (parseInt(page as string) - 1) * parseInt(limit as string) + 1,
    hasPrevPage,
    hasNextPage,
    prevPage: hasPrevPage ? parseInt(page as string) - 1 : null,
    nextPage: hasNextPage ? parseInt(page as string) + 1 : null,
  })
})

/**
 * @desc Get all newly created spaces with filters and pagination
 * @route   GET /api/v1/spaces/new
 * @access  Public
 */
