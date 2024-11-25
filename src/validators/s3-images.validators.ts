import { z } from "zod"
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../constants/image.constants"

// Schema for validating upload file properties
export const uploadFileSchema = z
  .object({
    fileName: z.string().min(1, "File name is required"), // Ensure file name is provided
    fileType: z.nativeEnum(ALLOWED_FILE_TYPES), // Only allow values in ALLOWED_FILE_TYPES
    fileSize: z.number().positive("File size must be a positive number"), // Ensure fileSize is positive
  })
  .refine((data) => data.fileSize <= MAX_FILE_SIZE, {
    message: `File too large. Max size is ${MAX_FILE_SIZE} bytes.`,
    path: ["fileSize"],
  })

// Schema for validating a single file name
export const FileNameSchema = z.string().min(1, "File name is required")

// Schema for validating an array of file names (for batch deletion)
export const FileNamesArraySchema = z.array(FileNameSchema).min(1, "At least one file name is required")
