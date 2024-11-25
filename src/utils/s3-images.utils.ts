import { S3Client, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import dotenv from "dotenv"
import { FileNameSchema, uploadFileSchema } from "../validators/s3-images.validators"
import { v4 as uuidv4 } from "uuid"

dotenv.config()

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_CLOUD_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_CLOUD_SECRET_ACCESS_KEY as string,
  },
  region: process.env.AWS_CLOUD_REGION as string,
})
const BUCKET_NAME = process.env.AWS_CLOUD_BUCKET_NAME as string
const MAX_FILE_UPLOAD = 5

interface FileData {
  fileName: string
  fileType: string
  fileSize: number
}

const handleError = (error: unknown, context: string): void => {
  if (error instanceof Error) {
    console.error(`Error in ${context}:`, error.message)
  } else {
    console.error(`Unknown error in ${context}:`, error)
  }
}

export const generateUniqueFileName = (folderName: string, fileType: string): string => {
  return `${folderName}/${uuidv4()}.${fileType.split("/").pop()}`
}

// Generate a presigned URL for a single file
export const generatePresignedUrl = async (folderName: string, fileData: FileData): Promise<string | null> => {
  try {
    uploadFileSchema.parse(fileData)
    const uniqueFileName = generateUniqueFileName(folderName, fileData.fileType)
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileData.fileType,
    })
    return await getSignedUrl(s3Client, command, { expiresIn: 600})
  } catch (error) {
    handleError(error, "generatePresignedUrlForFile")
    return null
  }
}

// Delete a single file
export const deleteFile = async (url: string): Promise<void> => {
  const pathSegments = url.split("/")
  const folderName = pathSegments[pathSegments.length - 2] // Gets 'room-images' or the last folder in the path
  const fileName = pathSegments[pathSegments.length - 1] // Gets the file name like '030890ab-1047-4d06-a850-c95d14b78299.jpeg'

  // console.log("Folder Name:", folderName)
  // console.log("File Name:", fileName)

  try {
    const fullFileName = `${folderName}/${fileName}`
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fullFileName,
      }),
    )
  } catch (error) {
    handleError(error, "deleteFile")
  }
}


// Update metadata for a single file
export const updateFileMetadata = async (folderName: string, fileName: string, metadata: Record<string, string>): Promise<void> => {
  try {
    FileNameSchema.parse(fileName)
    const fullFileName = `${folderName}/${fileName}`
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fullFileName,
        CopySource: `${BUCKET_NAME}/${fullFileName}`,
        Metadata: metadata,
        MetadataDirective: "REPLACE",
      }),
    )
  } catch (error) {
    handleError(error, "updateFileMetadata")
  }
}

// Generate multiple presigned URLs
export const generatePresignedUrls = async (folderName: string, fileData: FileData[]): Promise<string[]> => {
  if (fileData.length > MAX_FILE_UPLOAD) {
    console.error(`Exceeded max upload limit of ${MAX_FILE_UPLOAD}`)
    return []
  }

  try {
    const presignedUrls = await Promise.all(fileData.map((file) => generatePresignedUrl(folderName, file)))
    return presignedUrls.filter((url): url is string => url !== null) // Filter out null values
  } catch (error) {
    handleError(error, "generatePresignedUrls")
    return []
  }
}

// Delete multiple files
export const deleteMultipleFiles = async (urls:string[]): Promise<void> => {
  try {
    await Promise.all(urls.map((url) => deleteFile(url)))
    // console.log("Files deleted successfully.")
  } catch (error) {
    handleError(error, "deleteMultipleFiles")
  }
}

// Update metadata for multiple files
export const updateMultipleFilesMetadata = async (
  folderName: string,
  files: { fileName: string; metadata: Record<string, string> }[],
): Promise<void> => {
  try {
    await Promise.all(files.map(({ fileName, metadata }) => updateFileMetadata(folderName, fileName, metadata)))
    console.log("Metadata updated successfully.")
  } catch (error) {
    handleError(error, "updateMultipleFilesMetadata")
  }
}
