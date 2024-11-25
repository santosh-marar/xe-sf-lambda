import express from "express"
import { getUserById, updateUser, deleteUser, getPresignedUrlForUserAvatar } from "../controllers/user.controllers"
import isAuthenticated, { authorizeRoles, USER_ROLES } from "../middlewares/auth.middlewares"

const router = express.Router()

router.post("/get-signed-url", getPresignedUrlForUserAvatar)

router.get("/:id", isAuthenticated, getUserById)

router.put("/:id", isAuthenticated, updateUser)

router.delete("/:id", isAuthenticated, deleteUser)

export default router
