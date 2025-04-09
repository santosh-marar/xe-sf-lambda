// image.validation.ts
import { z } from "zod"
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../constants/image.constants"

export const imageValidation = z
  .object({
    base64: z.string().min(1, "Base64 data is required"),
    folder: z.string().min(1, "Folder name is required"),
    name: z.string().min(1, "File name is required"),
    type: z.nativeEnum(ALLOWED_FILE_TYPES, {
      message: `Invalid file type. Allowed types: ${Object.values(ALLOWED_FILE_TYPES).join(", ")}`,
    }),
  })
  .refine(
    (data) => {
      const buffer = Buffer.from(data.base64, "base64")
      return buffer.length <= MAX_FILE_SIZE
    },
    {
      message: `File too large. Max size is ${MAX_FILE_SIZE} bytes.`,
      path: ["base64"],
    },
  )

export const imageDeleteSchema = z.object({
  url: z.string().url("Invalid URL format").min(1, "URL is required"),
})

export const imageBatchDeleteSchema = z.object({
  urls: z.array(z.string().url("Invalid URL format")).min(1, "At least one URL is required"),
})
