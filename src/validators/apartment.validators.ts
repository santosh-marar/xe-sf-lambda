import { z } from "zod"
import mongoose from "mongoose"
import { COUNTRY, GENDER_PREFERENCE, LISTING_TYPE } from "../models/room.models"

// Zod schema for Apartment validation
export const apartmentZodSchema = z.object({
  userId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid ObjectId" }),
  country: z.nativeEnum(COUNTRY).default(COUNTRY.NEPAL),
  district: z
    .string()
    .optional()
    .transform((val) => val?.toLowerCase().trim()),
  city: z.string().transform((val) => val.toLowerCase().trim()),
  chowk: z.string().transform((val) => val.toLowerCase().trim()),
  street: z
    .string()
    .optional()
    .transform((val) => val?.toLowerCase().trim()),
  houseNumber: z
    .string()
    .optional()
    .transform((val) => val?.toLowerCase().trim()),
  spaceImagesUrl: z.array(z.string()).optional(),
  facility: z.object({
    water: z.boolean().optional().default(false),
    table: z.boolean().optional().default(false),
    chair: z.boolean().optional().default(false),
    clothesHanger: z.boolean().optional().default(false),
    bed: z.boolean().optional().default(false),
    fan: z.boolean().optional().default(false),
    wifi: z.boolean().optional().default(false),
    parking: z.string().optional(),
  }),
  genderPreference: z.nativeEnum(GENDER_PREFERENCE).default(GENDER_PREFERENCE.FOR_ALL),
  isSpaceProviderLiving: z.boolean().optional().default(true),
  descriptionOfSpace: z.string().transform((val) => val.toLowerCase().trim()),
  rulesOfLiving: z.string().transform((val) => val.toLowerCase().trim()),
  phoneNumber: z.number().positive(),
  fare: z.number().min(0, { message: "Fare must be non-negative" }),
  nearPopularPlace: z.string().transform((val) => val.toLowerCase().trim()),
  listingType: z
    .string()
    .default(LISTING_TYPE.RENT)
    .transform((val) => val.toLowerCase().trim()),
  noOfBedrooms: z.number().min(1, { message: "Must have at least one bedroom" }),
  noOfBathrooms: z.number().min(1, { message: "Must have at least one bathroom" }),
  noOfKitchens: z.number().min(1, { message: "Must have at least one kitchen" }),
  noOfParkingSpaces: z.string().optional(),
  furnish: z.string().transform((val) => val.toLowerCase().trim()),
  floor: z.number().min(0, { message: "Floor must be non-negative" }),
  isAvailable: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Infer TypeScript types from the Zod schema
export type ApartmentCreateTypes = z.infer<typeof apartmentZodSchema>

export const apartmentUpdateSchema = apartmentZodSchema.partial()

export type ApartmentUpdateTypes = z.infer<typeof apartmentUpdateSchema>
