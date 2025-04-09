import express from "express"
import { uploadImage, deleteImage, deleteImages } from "../controllers/image.controllers"
import isAuthenticated from "../middlewares/auth.middlewares"

const router = express.Router()

// Protected routes
router.post("/upload",isAuthenticated, uploadImage)
router.delete("/delete", isAuthenticated, deleteImage)
router.delete("/delete-multiple", isAuthenticated, deleteImages)

export default router
