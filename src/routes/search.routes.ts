import express from "express"
import { getSpaces, recentlyCreatedSpaces } from "../controllers/room.controllers"

const router = express.Router()

router.get("/search", getSpaces)

router.get("/new", recentlyCreatedSpaces)

export default router
