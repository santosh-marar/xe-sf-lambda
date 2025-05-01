import { z } from "zod"
import { COUNTRY, LISTING_PURPOSE, SPACE_CATEGORIES, SPACE_TYPES } from "../models/room.models"
import { FURNISH_STATUS } from "../models/flat.models"

export const createHouseSchemaValidation = z.object({
  userId: z.string().min(1),
  country: z.nativeEnum(COUNTRY).default(COUNTRY.NEPAL),
  title: z.string().trim().toLowerCase(),
  descriptionOfSpace: z.string().trim().toLowerCase(),
  spaceImagesUrl: z.array(z.string()).optional(),
  videoUrl: z.string().trim().optional(),
  phoneNumber: z.number(),
  listingType: z.nativeEnum(LISTING_PURPOSE).default(LISTING_PURPOSE.RENT),
  spaceType: z.nativeEnum(SPACE_TYPES).default(SPACE_TYPES.COMMERCIAL),
  spaceCategories: z.nativeEnum(SPACE_CATEGORIES).default(SPACE_CATEGORIES.HOUSE),
  city: z.string().trim().toLowerCase(),
  chowk: z.string().trim().toLowerCase(),
  municipality: z.string().trim().toLowerCase(),
  wardNo: z.number(),
  totalArea: z.string().trim().toLowerCase(),
  buildUpArea: z.string().trim().toLowerCase(),
  noOfBedrooms: z.number(),
  noOfBathrooms: z.number(),
  noOfKitchens: z.number(),
  buildYear: z.number(),
  furnish: z.nativeEnum(FURNISH_STATUS).default(FURNISH_STATUS.FULL),
  noOfFloors: z.number(),
  noOfLivingRooms: z.number(),
  noOfParkingSpaces: z.number(),
  dimension: z.string().trim().toLowerCase().optional(),
  roadType: z.string().trim().toLowerCase(),
  propertyFace: z.string().trim().toLowerCase(),
  roadAccess: z.string().trim().toLowerCase(),
  plotNumber: z.string(),

  facilities: z
    .object({
      securityStaff: z.boolean().optional(),
      elevator: z.boolean().optional(),
      maintenances: z.boolean().optional(),
      kidsPlayGround: z.boolean().optional(),
      electricityBackup: z.boolean().optional(),
      cafeteria: z.boolean().optional(),
      washingMachine: z.boolean().optional(),
      TVCable: z.boolean().optional(),
      swimmingPool: z.boolean().optional(),
      modularKitchen: z.boolean().optional(),
      microwave: z.boolean().optional(),
      gym: z.boolean().optional(),
      cctv: z.boolean().optional(),
      garden: z.boolean().optional(),
      fencing: z.boolean().optional(),
      balcony: z.boolean().optional(),
      ac: z.boolean().optional(),
      waterTank: z.boolean().optional(),
      waterSupply: z.boolean().optional(),
      drainage: z.boolean().optional(),
      jacuzzi: z.boolean().optional(),
      garage: z.boolean().optional(),
      lawn: z.boolean().optional(),
    })
    .optional(),

  nearByLocation: z
    .object({
      landmark: z.string().trim().toLowerCase().optional(),
      hospital: z.string().trim().toLowerCase().optional(),
      school: z.string().trim().toUpperCase().optional(),
      park: z.string().trim().toLowerCase().optional(),
      market: z.string().trim(),
      policeStation: z.string().trim().toLowerCase().optional(),
      fireStation: z.string().trim().toLowerCase().optional(),
      bank: z.string().trim().toLowerCase().optional(),
      postOffice: z.string().trim().toLowerCase().optional(),
      atm: z.string().trim().optional(),
      library: z.string().trim().toLowerCase().optional(),
      pharmacy: z.string().trim().toLowerCase().optional(),
      wardOffice: z.string().trim().toLowerCase().optional(),
      restaurant: z.string().trim().toLowerCase().optional(),
      busStation: z.string().trim().toLowerCase().optional(),
      cinemaHall: z.string().trim().toLowerCase().optional(),
    })
    .optional(),

  fare: z.number().min(0),
  isFareNegotiable: z.boolean(),
  isAvailable: z.boolean().optional(),
  isExclusive: z.boolean().optional(),
})

export const updateHouseSchemaValidation = createHouseSchemaValidation.partial()

export type HouseCreateType = z.infer<typeof createHouseSchemaValidation>
export type HouseUpdateType = z.infer<typeof updateHouseSchemaValidation>
