import express from "express"
import { createUser, loginUser, logoutUser, refreshToken } from "../controllers/auth.controllers"
import isAuthenticated from "../middlewares/auth.middlewares"

const router = express.Router()

router.post("/signup", createUser)
router.post("/login", loginUser)
router.post("/refresh", refreshToken)
router.post("/logout", isAuthenticated, logoutUser)

export default router
