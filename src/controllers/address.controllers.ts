import { Request, Response } from "express"
import Address from "../models/address.models"
import { addressSchema, AddressTypes, addressUpdateSchema } from "../validators/address.validators"
import asyncMiddleware from "../middlewares/async.middlewares"
import CustomErrorHandler from "../utils/error.utils"
import { USER_ROLES } from "../middlewares/auth.middlewares"

// @desc Create an address
// @route POST /api/v1/addresses
// @access Private (only accessible to authenticated users)
export const createAddress = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req?.user?._id

  const foundAddress = await Address.findOne({ userId })
  if (foundAddress) throw new CustomErrorHandler(400, "You already have an address")

  const validatedData: AddressTypes = addressSchema.parse({ ...req.body, userId })
  const address = new Address(validatedData)
  await address.save()
  return res.status(201).json({
    success: true,
    messages: "Address created successfully",
    data: address,
  })
})

// @desc Get an address by ID
// @route GET /api/v1/addresses/:id
// @access Private (only accessible to the owner of the address) & Admin
export const getAddressById = asyncMiddleware(async (req: Request, res: Response) => {
  const foundAddress = await Address.findById(req.params.id)
  if (!foundAddress) {
    throw new CustomErrorHandler(404, "Address not found")
  }

  const user = req.user
  const isAdmin = user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundAddress.userId.toString() === user?._id.toString()

  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  return res.status(200).json({
    success: true,
    messages: "Address found successfully",
    data: foundAddress,
  })
})

// @desc Update an address by ID
// @route POST /api/v1/addresses/:id
// @access Private (only accessible to the owner of the address) & Admin
export const updateAddress = asyncMiddleware(async (req: Request, res: Response) => {
  const validatedData = addressUpdateSchema.parse(req.body)

  const foundAddress = await Address.findById(req.params.id)
  if (!foundAddress) {
    throw new CustomErrorHandler(404, "Address not found")
  }

  // Check if the user is an admin or the owner of the address
  const isAdmin = req.user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundAddress.userId.toString() === req.user?._id.toString()
  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  const updatedAddress = await Address.findByIdAndUpdate(req.params.id, validatedData, {
    new: true,
    runValidators: true,
  })

  return res.status(200).json({
    success: true,
    messages: "Address updated successfully",
    data: updatedAddress,
  })
})

// @desc Delete an address by ID
// @route Delete /api/v1/addresses/:id
// @access Private (only accessible to the owner of the address) & Admin
export const deleteAddress = asyncMiddleware(async (req: Request, res: Response) => {
  const foundAddress = await Address.findById(req.params.id)
  if (!foundAddress) return res.status(404).json({ message: "Address not found" })

  // Check if the user is an admin or the owner of the address
  const isAdmin = req.user?.roles?.includes(USER_ROLES.ADMIN)
  const isOwner = foundAddress.userId.toString() === req.user?._id.toString()
  if (!isAdmin && !isOwner) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  const deletedAddress = await Address.findByIdAndDelete(req.params.id)
  if (!deletedAddress) throw new CustomErrorHandler(404, "Address not found")

  return res.status(200).json({
    success: true,
    messages: "Address deleted successfully",
    data: deletedAddress,
  })
})

// @desc Get all addresses with their respective user details
// @route GET /api/v1/addresses-with-user
// @access Private only Admin
export const getAllAddressesWithUser = asyncMiddleware(async (req: Request, res: Response) => {
  const user = req.user
  const isAdmin = user?.roles?.includes(USER_ROLES.ADMIN)

  if (!isAdmin) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  // Pagination setup
  const pageNumber = parseInt(req.query.page as string, 10) || 1
  const pageSize = parseInt(req.query.limit as string, 10) || 10

  // Aggregation pipeline for pagination
  const addressesAggregate = Address.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        userId: 1,
        street: 1,
        city: 1,
        state: 1,
        country: 1,
        zipCode: 1,
        isDefault: 1,
        user: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
          phoneNumber: "$user.phoneNumber",
          userAvatar: "$user.userAvatar",
          roles: "$user.roles",
          isVerified: "$user.isVerified",
          isEmailVerified: "$user.isEmailVerified",
        },
      },
    },
  ])

  // Aggregation to count total addresses
  const totalAddressesAggregate = Address.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $count: "total" },
  ])

  // Perform aggregation and pagination
  const [paginatedAddresses, totalAddressesResult] = await Promise.all([
    addressesAggregate.skip((pageNumber - 1) * pageSize).limit(pageSize),
    totalAddressesAggregate,
  ])

  // If no addresses found
  if (paginatedAddresses.length === 0) {
    throw new CustomErrorHandler(400, "No addresses found")
  }

  // Pagination metadata
  const totalNoOfAddresses = totalAddressesResult[0]?.total || 0
  const totalPages = Math.ceil(totalNoOfAddresses / pageSize)
  const pagination = {
    currentPage: pageNumber,
    totalPages,
    pageSize,
    totalNoOfAddresses,
    hasPrevPage: pageNumber > 1,
    hasNextPage: pageNumber < totalPages,
  }

  // Response with paginated addresses and metadata
  res.status(200).json({
    success: true,
    message: "Addresses found successfully",
    data: paginatedAddresses,
    pagination,
  })
})

// export const getAllAddressesWithUser = asyncMiddleware(async (req: Request, res: Response) => {
//   const user = req.user
//   const isAdmin = user?.roles?.includes("admin")

//   if (!isAdmin) {
//     throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
//   }

//   const foundAllAddresses = await Address.find().populate({
//     path: "userId",
//     select: "-password -__v",
//   })

//   if (!foundAllAddresses) {
//     throw new CustomErrorHandler(400, "No addresses found")
//   }

//   res.status(200).json({
//     success: true,
//     message: "Addresses found successfully",
//     data: foundAllAddresses,
//   })
// })
