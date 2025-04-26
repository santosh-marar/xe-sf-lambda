import { Request, Response } from "express"
import asyncMiddleware from "../middlewares/async.middlewares"
import House from "../models/house.models"
import {
  createHouseSchemaValidation,
  updateHouseSchemaValidation,
  HouseCreateType,
  HouseUpdateType,
} from "../validators/house.validators"
import CustomErrorHandler from "../utils/error.utils"
import { USER_ROLES } from "../middlewares/auth.middlewares"
import { deleteMultipleFiles } from "../utils/s3-images.utils"

const allowedSortBy = ["fare", "createdAt"] as const
const allowedSortOrder = ["asc", "desc"] as const

type SortByType = (typeof allowedSortBy)[number]
type SortOrderType = (typeof allowedSortOrder)[number]

export const createHouse = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req?.user?._id

  const validatedData: HouseCreateType = createHouseSchemaValidation.parse({
    ...req.body,
    userId,
  })

  const newHouse = await House.create(validatedData)

  res.status(201).json({
    success: true,
    message: "House created successfully",
    data: newHouse,
  })
})

export const getAllHouses = asyncMiddleware(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    fareMin,
    fareMax,
    isAvailable,
    listingType,
    locationQuery,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query as Record<string, any>

  const filters: Record<string, any> = {}

  if (fareMin) filters.fare = { $gte: Number(fareMin) }
  if (fareMax) filters.fare = { ...filters.fare, $lte: Number(fareMax) }

  if (locationQuery) {
    filters.$or = [
      { city: { $regex: locationQuery, $options: "i" } },
      { chowk: { $regex: locationQuery, $options: "i" } },
      { municipality: { $regex: locationQuery, $options: "i" } },
    ]
  }

  if (typeof isAvailable !== "undefined") filters.isAvailable = isAvailable === "true"
  if (listingType) filters.listingType = listingType

  const finalSortBy: SortByType = allowedSortBy.includes(sortBy) ? sortBy : "createdAt"
  const finalSortOrder: SortOrderType = allowedSortOrder.includes(sortOrder) ? sortOrder : "desc"

  const sortOption: Record<string, 1 | -1> = {
    [finalSortBy]: finalSortOrder === "asc" ? 1 : -1,
  }

  const houses = await House.paginate(filters, {
    page: Number(page),
    limit: Number(limit),
    sort: sortOption,
  })

  if (!houses || houses.docs.length === 0) {
    throw new CustomErrorHandler(404, "Houses not found")
  }

  res.status(200).json({
    success: true,
    message: "Houses retrieved successfully",
    data: houses,
  })
})

export const getHouseById = asyncMiddleware(async (req: Request, res: Response) => {
  const house = await House.findById(req.params.id)
  if (!house) {
    throw new CustomErrorHandler(404, "House not found")
  }

  res.status(200).json({
    success: true,
    message: "House retrieved successfully",
    data: house,
  })
})

export const getMyHouses = asyncMiddleware(async (req: Request, res: Response) => {
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

  const result = await House.paginate({ userId }, options)

  if (!result || result.docs.length === 0) {
    throw new CustomErrorHandler(404, "Houses not found")
  }

  res.json({
    success: true,
    message: "Found my houses successfully",
    data: result,
  })
})

export const updateHouse = asyncMiddleware(async (req: Request, res: Response) => {
  const validatedData: HouseUpdateType = updateHouseSchemaValidation.parse(req.body)

  const updatedHouse = await House.findByIdAndUpdate(req.params.id, validatedData, {
    new: true,
    runValidators: true,
  })

  if (!updatedHouse) {
    throw new CustomErrorHandler(404, "House not found for update")
  }

  res.status(200).json({
    success: true,
    message: "House updated successfully",
    data: updatedHouse,
  })
})

export const deleteHouse = asyncMiddleware(async (req: Request, res: Response) => {
  const foundHouse = await House.findById(req.params.id)

  if (!foundHouse) {
    throw new CustomErrorHandler(404, "House not found")
  }

  // Check if the user is an admin or the owner of the address
  const isAdmin = req.user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundHouse.userId.toString() === req.user?._id.toString()
  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  // Ensure image is deleted
  if (foundHouse?.spaceImagesUrl && foundHouse?.spaceImagesUrl.length > 0) {
    const deleteImage = await deleteMultipleFiles(foundHouse?.spaceImagesUrl)
  }

  const deletedHouse = await House.findByIdAndDelete(req.params.id)

  if (!deletedHouse) {
    throw new CustomErrorHandler(404, "House not found for deletion")
  }

  res.status(200).json({
    success: true,
    message: "House deleted successfully",
  })
})
