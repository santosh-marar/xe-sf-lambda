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

const allowedSortBy = ["price", "createdAt"] as const
const allowedSortOrder = ["asc", "desc"] as const

type SortByType = (typeof allowedSortBy)[number]
type SortOrderType = (typeof allowedSortOrder)[number]

export const getAllLands = asyncMiddleware(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    minPrice,
    maxPrice,
    isAvailable,
    listingType,
    city,
    chowk,
    municipality,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query as Record<string, any>

  const filters: Record<string, any> = {}

  if (minPrice) filters.price = { $gte: Number(minPrice) }
  if (maxPrice) filters.price = { ...filters.price, $lte: Number(maxPrice) }

  if (city) filters.city = { $regex: city, $options: "i" }
  if (chowk) filters.chowk = { $regex: chowk, $options: "i" }
  if (municipality) filters.municipality = { $regex: municipality, $options: "i" }

  if (typeof isAvailable !== "undefined") filters.isAvailable = isAvailable === "true"
  if (listingType) filters.listingType = listingType

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
  return res.status(200).json({ success: true, message:"Land found successfully", data: land })
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

  const deletedLand = await Land.findByIdAndDelete(req.params.id)
  if (!deletedLand) {
    throw new CustomErrorHandler(404, "Land not found")
  }

  return res.status(200).json({ success: true, message: "Land deleted successfully" })
})
