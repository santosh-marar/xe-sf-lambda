import { z } from "zod"

export const userCreateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name can't exceed 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.number().int().positive(),
  userAvatarUrl: z.string().url().optional(),
  isVerified: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
})

export type UserCreateTypes = z.infer<typeof userCreateSchema>

// Zod Validation Schema for User Update (allows partial updates)
export const userUpdateSchema = userCreateSchema.partial()

export type UserUpdateTypes = z.infer<typeof userUpdateSchema>
