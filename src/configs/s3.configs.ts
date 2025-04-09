import { S3Client } from "@aws-sdk/client-s3"

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

// import { S3Client } from "@aws-sdk/client-s3"

// export const s3Client = new S3Client({
//   region: process.env.NEXT_PUBLIC_AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
//   },
// })