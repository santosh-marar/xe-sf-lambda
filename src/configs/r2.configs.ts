import { S3Client } from "@aws-sdk/client-s3"
import { envConfig } from "./env.configs"

export const initializeR2Client = (): S3Client => {
  return new S3Client({
    endpoint: `https://${envConfig.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: envConfig.R2_ACCESS_KEY_ID as string,
      secretAccessKey: envConfig.R2_SECRET_ACCESS_KEY as string,
    },
    region: "auto",
  })
}
