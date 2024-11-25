export interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
}

export interface UploadParams {
  fileName: string
  fileType: string
  fileSize: number
  maxSize?: number
  allowedTypes?: string[]
}

export interface PresignedUrlResponse {
  url: string
  fields: Record<string, string>
}
