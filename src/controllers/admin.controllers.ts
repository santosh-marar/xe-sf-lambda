import { Request, Response } from "express"
import User from "../models/users.models"

import asyncMiddleware from "../middlewares/async.middlewares"
import Room from "../models/room.models"
import Flat from "../models/flat.models"
import CustomErrorHandler from "../utils/error.utils"
import { USER_ROLES } from "../middlewares/auth.middlewares"

export const adminDashboardApi = asyncMiddleware(async (req: Request, res: Response) => {
  const { days = 7 } = req.query // Default to 7 days if not provided
  const daysInt = parseInt(days as string, 10)

  if (isNaN(daysInt) || daysInt <= 0 || daysInt > 730) {
    res.status(400).json({ message: "Invalid days parameter. Must be between 1 and 730." })
    return
  }

  const START_DATE = new Date(Date.now() - daysInt * 24 * 60 * 60 * 1000)

  // Parallel fetching for growth calculations and latest data
  const [
    totalUsers,
    totalRooms,
    totalFlats,
    newUsersCount,
    newRoomsCount,
    newFlatsCount,
    latestUsers,
    latestRooms,
    latestFlats,
  ] = await Promise.all([
    User.countDocuments(),
    Room.countDocuments(),
    Flat.countDocuments(),
    User.countDocuments({ createdAt: { $gte: START_DATE } }),
    Room.countDocuments({ createdAt: { $gte: START_DATE } }),
    Flat.countDocuments({ createdAt: { $gte: START_DATE } }),
    User.aggregate([
      { $sort: { createdAt: -1 } }, // Sort by newest first
      { $limit: 5 }, // Get the top 5
      {
        $project: {
          _id: 1,
          email: 1,
          userAvatarUrl: 1,
          phoneNumber: 1,
          name: 1,
          isVerified: 1,
        },
      },
    ]),
    Room.aggregate([
      { $sort: { createdAt: -1 } }, // Sort by newest first
      { $limit: 5 }, // Get the top 5
      {
        $project: {
          _id: 1,
          fare: 1,
          city: 1,
          chowk: 1,
          genderPreference: 1,
          nearPopularPlace: 1,
          spaceCategories: 1,
          descriptionOfSpace: 1,
          spaceImagesUrl: 1,
        },
      },
    ]),
    Flat.aggregate([
      { $sort: { createdAt: -1 } }, // Sort by newest first
      { $limit: 5 }, // Get the top 5
      {
        $project: {
          _id: 1,
          fare: 1,
          city: 1,
          chowk: 1,
          genderPreference: 1,
          nearPopularPlace: 1,
          spaceCategories: 1,
          descriptionOfSpace: 1,
          spaceImagesUrl: 1,
        },
      },
    ]),
  ])

  // Calculate growth percentages
  const userGrowth = ((newUsersCount / Math.max(1, totalUsers - newUsersCount)) * 100).toFixed(2)
  const roomGrowth = ((newRoomsCount / Math.max(1, totalRooms - newRoomsCount)) * 100).toFixed(2)
  const flatGrowth = ((newFlatsCount / Math.max(1, totalFlats - newFlatsCount)) * 100).toFixed(2)

  // Response
  res.json({
    overview: {
      totalUsers,
      userGrowth,
      totalRooms,
      roomGrowth,
      totalFlats,
      flatGrowth,
      period: `${daysInt} days`,
    },
    latest: {
      users: latestUsers,
      rooms: latestRooms,
      flats: latestFlats,
    },
  })
})

// @desc Get all users with their respective user details
// @route GET /api/v1/users-details
// @access Private only Admin
export const getAllUsers = asyncMiddleware(async (req: Request, res: Response) => {
  // Paginate and exclude password field
  const foundAllUsers = await User.paginate(
    {},
    {
      select: "-password -__v",
    },
  )

  if (foundAllUsers.docs.length === 0) {
    throw new CustomErrorHandler(400, "No users found")
  }

  res.status(200).json({
    success: true,
    message: "Users found successfully",
    data: foundAllUsers,
  })
})

// @desc    Get all rooms with their respective user details
// @route   GET /api/v1/rooms-with-owner
// @access  Private only Admin
export const getAllRoomsWithUser = asyncMiddleware(async (req: Request, res: Response) => {
  const user = req.user
  const isAdmin = user?.roles?.includes(USER_ROLES.ADMIN)

  if (!isAdmin) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  // Pagination setup
  const pageNumber = parseInt(req.query.page as string, 10) || 1
  const pageSize = parseInt(req.query.limit as string, 10) || 10

  // Aggregation pipeline for pagination
  const roomsAggregate = Room.aggregate([
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
        // country: 1,
        // district: 1,
        city: 1,
        chowk: 1,
        street: 1,
        homeNumber: 1,
        spaceImagesUrl: 1,
        // facility: 1,
        genderPreference: 1,
        isSpaceProviderLiving: 1,
        descriptionOfRoom: 1,
        rulesOfLiving: 1,
        phoneNumber: 1,
        fare: 1,
        nearPopularPlace: 1,
        listingType: 1,
        isAvailable: 1,
        isActive: 1,
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

  // Aggregation to count total rooms
  const totalRoomsAggregate = Room.aggregate([
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
  const [paginatedRooms, totalRoomsResult] = await Promise.all([
    roomsAggregate.skip((pageNumber - 1) * pageSize).limit(pageSize),
    totalRoomsAggregate,
  ])

  // If no rooms found
  if (paginatedRooms.length === 0) {
    throw new CustomErrorHandler(400, "No rooms found")
  }

  // Pagination metadata
  const totalNoOfRooms = totalRoomsResult[0]?.total || 0
  const totalPages = Math.ceil(totalNoOfRooms / pageSize)
  const pagination = {
    currentPage: pageNumber,
    totalPages,
    pageSize,
    totalNoOfRooms,
    hasPrevPage: pageNumber > 1,
    hasNextPage: pageNumber < totalPages,
  }

  // Response with paginated rooms and metadata
  res.status(200).json({
    success: true,
    message: "Rooms found successfully",
    data: paginatedRooms,
    pagination,
  })
})

// @desc    Get all flats with their respective user details
// @route   GET /api/v1/flats-with-owner
// @access  Private only Admin
export const getAllFlatsWithUser = asyncMiddleware(async (req: Request, res: Response) => {
  const user = req.user
  const isAdmin = user?.roles?.includes(USER_ROLES.ADMIN)

  if (!isAdmin) {
    throw new CustomErrorHandler(403, "Forbidden: Insufficient permissions")
  }

  // Pagination setup
  const pageNumber = parseInt(req.query.page as string, 10) || 1
  const pageSize = parseInt(req.query.limit as string, 10) || 10

  // Aggregation pipeline for pagination
  const flatsAggregate = Flat.aggregate([
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
        // userId: 1,
        // country: 1,
        // district: 1,
        city: 1,
        chowk: 1,
        street: 1,
        homeNumber: 1,
        spaceImagesUrl: 1,
        // facility: 1,
        genderPreference: 1,
        isSpaceProviderLiving: 1,
        descriptionOfFlat: 1,
        rulesOfLiving: 1,
        phoneNumber: 1,
        fare: 1,
        nearPopularPlace: 1,
        listingType: 1,
        isAvailable: 1,
        isActive: 1,
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

  // Aggregation to count total flats
  const totalFlatsAggregate = Flat.aggregate([
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
  const [paginatedFlats, totalFlatsResult] = await Promise.all([
    flatsAggregate.skip((pageNumber - 1) * pageSize).limit(pageSize),
    totalFlatsAggregate,
  ])

  // If no flats found
  if (paginatedFlats.length === 0) {
    throw new CustomErrorHandler(400, "No flats found")
  }

  // Pagination metadata
  const totalNoOfFlats = totalFlatsResult[0]?.total || 0
  const totalPages = Math.ceil(totalNoOfFlats / pageSize)
  const pagination = {
    currentPage: pageNumber,
    totalPages,
    pageSize,
    totalNoOfFlats,
    hasPrevPage: pageNumber > 1,
    hasNextPage: pageNumber < totalPages,
  }

  // Response with paginated flats and metadata
  res.status(200).json({
    success: true,
    message: "Flats found successfully",
    data: paginatedFlats,
    pagination,
  })
})
