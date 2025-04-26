import { z } from "zod"
import { COUNTRY, LISTING_PURPOSE, SPACE_TYPES, SPACE_CATEGORIES } from "../models/room.models"

export const createLandSchemaValidation = z.object({
  country: z.nativeEnum(COUNTRY).default(COUNTRY.NEPAL),
  title: z.string().min(1),
  descriptionOfSpace: z.string().min(1),
  spaceImagesUrl: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  listingType: z.nativeEnum(LISTING_PURPOSE).default(LISTING_PURPOSE.RENT),
  spaceType: z.nativeEnum(SPACE_TYPES).default(SPACE_TYPES.COMMERCIAL),
  spaceCategories: z.nativeEnum(SPACE_CATEGORIES).default(SPACE_CATEGORIES.LAND),
  city: z.string().min(1),
  chowk: z.string().min(1),
  municipality: z.string().min(1),
  wardNo: z.number(),
  totalArea: z.string().min(1),
  dimension: z.string().optional(),
  roadType: z.string().min(1),
  propertyFace: z.string().min(1),
  roadAccess: z.string().min(1),
  plotNumber: z.string().min(1),
  nearByLocation: z
    .object({
      landmark: z.string().optional(),
      hospital: z.string().optional(),
      school: z.string().optional(),
      park: z.string().optional(),
      market: z.string().min(1),
      policeStation: z.string().optional(),
      fireStation: z.string().optional(),
      bank: z.string().optional(),
      postOffice: z.string().optional(),
      atm: z.string().optional(),
      library: z.string().optional(),
      pharmacy: z.string().optional(),
      wardOffice: z.string().optional(),
      restaurant: z.string().optional(),
      busStation: z.string().optional(),
      cinemaHall: z.string().optional(),
    })
    .optional(),
  fare: z.number().min(0),
  isFareNegotiable: z.boolean(),
  isAvailable: z.boolean().optional(),
  isExclusive: z.boolean().optional(),
})

export type LandCreateType = z.infer<typeof createLandSchemaValidation>

export const updateLandSchemaValidation = createLandSchemaValidation.partial()

export type LandUpdateType = z.infer<typeof updateLandSchemaValidation>

export const deleteLandSchemaValidation = z.string().min(1)

export type LandDeleteType = z.infer<typeof deleteLandSchemaValidation>
