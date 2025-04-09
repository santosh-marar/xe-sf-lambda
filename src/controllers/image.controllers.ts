// image.controller.ts
import { Request, Response } from "express"
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import asyncMiddleware from "../middlewares/async.middlewares"
import { imageBatchDeleteSchema, imageDeleteSchema, imageValidation } from "../validators/image.validators"
import { initializeS3Client } from "../configs/s3.configs"

const s3Client= initializeS3Client()

export const uploadImage = asyncMiddleware(async (req: Request, res: Response) => {
  const validationResult = imageValidation.safeParse(req.body)
  if (!validationResult.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationResult.error.flatten(),
    })
  }

  const input = validationResult.data
  const buffer = Buffer.from(input.base64, "base64")
  const key = `${input.folder}/${crypto.randomUUID()}-${input.name}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_CLOUD_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: input.type,
  })

  await initializeS3Client().send(command)

  return res.status(201).json({
    success: true,
    // url: `https://${process.env.AWS_CLOUD_BUCKET_NAME}.s3.amazonaws.com/${key}`,
    url: `https://s3.${process.env.AWS_CLOUD_REGION}.amazonaws.com/${process.env.AWS_CLOUD_BUCKET_NAME}/${key}`,
  })
})

export const deleteImage = asyncMiddleware(async (req: Request, res: Response) => {
  const validationResult = imageDeleteSchema.safeParse(req.body)
  if (!validationResult.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationResult.error.flatten(),
    })
  }

  const { url } = validationResult.data
  const parsedUrl = new URL(url)
  const key = decodeURIComponent(parsedUrl.pathname.slice(1))

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_CLOUD_BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)

  return res.json({
    success: true,
    deletedUrl: url,
  })
})

export const deleteImages = asyncMiddleware(async (req: Request, res: Response) => {
  const validationResult = imageBatchDeleteSchema.safeParse(req.body)
  if (!validationResult.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationResult.error.flatten(),
    })
  }

  const { urls } = validationResult.data
  const deletedUrls: string[] = []

  await Promise.all(
    urls.map(async (url) => {
      const parsedUrl = new URL(url)
      const key = decodeURIComponent(parsedUrl.pathname.slice(1))

      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_CLOUD_BUCKET_NAME,
        Key: key,
      })

      await s3Client.send(command)
      deletedUrls.push(url)
    }),
  )

  return res.json({
    success: true,
    deletedUrls,
  })
})
