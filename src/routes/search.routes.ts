import express from "express"
import { getSpaces } from "../controllers/room.controllers"

const router = express.Router()

router.get("/search", getSpaces)

export default router
