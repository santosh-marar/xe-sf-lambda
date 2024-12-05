import { z } from "zod"
import mongoose from "mongoose"
import { COUNTRY, GENDER_PREFERENCE, LISTING_TYPE } from "../models/room.models"

// Facility schema
const facilitySchema = z.object({
  water: z.boolean().optional(),
  table: z.boolean().optional(),
  chair: z.boolean().optional(),
  clothesHanger: z.boolean().optional(),
  bed: z.boolean().optional(),
  fan: z.boolean().optional(),
  wifi: z.boolean().optional(),
  parking: z.string().optional(),
})

// Room validation schema
export const roomCreateSchemaValidation = z.object({
  userId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid user ID format",
  }),
  country: z.nativeEnum(COUNTRY).default(COUNTRY.NEPAL),
  district: z.string().trim().toLowerCase().min(1, "District is required"),
  city: z.string().trim().toLowerCase().min(1, "City is required"),
  chowk: z.string().trim().toLowerCase().min(1, "Chowk name is required"),
  street: z.string().trim().toLowerCase().optional(),
  homeNumber: z.string().trim().toLowerCase().optional(),
  spaceImagesUrl: z.array(z.string().url()).optional(),
  facility: facilitySchema.optional(),
  genderPreference: z.nativeEnum(GENDER_PREFERENCE).default(GENDER_PREFERENCE.FOR_ALL),
  isSpaceProviderLiving: z.boolean().default(true),
  descriptionOfSpace: z.string().trim().toLowerCase().min(1, "Description of room is required"),
  rulesOfLiving: z.string().trim().toLowerCase().min(1, "Rules of living are required"),
  phoneNumber: z.number().min(10, "Phone number must be 10 digits"),
  fare: z.number().min(0, "Fare must be non-negative"),
  nearPopularPlace: z.string().trim().toLowerCase().min(1, "Near popular place name is required"),
  listingType: z.nativeEnum(LISTING_TYPE).default(LISTING_TYPE.RENT),
  isAvailable: z.boolean().default(true),
})

export type RoomCreateTypes = z.infer<typeof roomCreateSchemaValidation>

export const roomUpdateSchema = roomCreateSchemaValidation.partial()

export type RoomUpdateTypes = z.infer<typeof roomUpdateSchema>
