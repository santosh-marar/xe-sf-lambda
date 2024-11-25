import { S3Client } from "@aws-sdk/client-s3"
// import "dotenv/config"

// Initialize S3 Client for AWS
export const initializeS3Client = () => {
  return new S3Client({
    region: process.env.AWS_CLOUD_REGION, // Your AWS region
    credentials: {
      accessKeyId: process.env.AWS_CLOUD_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_CLOUD_SECRET_ACCESS_KEY as string,
    },
  })
}
