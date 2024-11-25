import { z } from "zod"
import mongoose from "mongoose"

// Zod schema for address validation
export const addressSchema = z.object({
  userId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid user ID format",
  }),
  country: z.string().min(2, "Country must be at least 2 characters").max(50, "Country can't exceed 50 characters").optional(),
  state: z.string().min(1, "State must be at least 2 characters").max(50, "State can't exceed 50 characters"),
  city: z.string().min(2, "City must be at least 2 characters").max(50, "City can't exceed 50 characters"),
  chowk: z.string().min(2, "Chowk must be at least 2 characters").max(50, "Chowk can't exceed 50 characters"),
  street: z.string().min(5, "Street must be at least 5 characters").max(100, "Street can't exceed 100 characters").optional(),
  houseNumber: z
    .string()
    .min(1, "House number must be at least 1 characters")
    .max(50, "House number can't exceed 50 characters")
    .optional(),
  zipCode: z.string().regex(/^[0-9]{5}(-[0-9]{4})?$/, "Invalid ZIP code format").optional(),
  isDefault: z.boolean().optional(),
})

// Type for TypeScript validation
export type AddressTypes = z.infer<typeof addressSchema>

// Separate schema for updating an address where all fields are optional
export const addressUpdateSchema = addressSchema.partial()
