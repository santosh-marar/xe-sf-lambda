import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    phoneNumber: z.number().int().positive().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "Either email or phone number must be provided",
    path: ["email", "phoneNumber"], // Show the error on both fields
  })
