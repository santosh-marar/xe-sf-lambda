import express from "express"
import isAuthenticated, { authorizeRoles, USER_ROLES } from "../middlewares/auth.middlewares"
import {
  adminDashboardApi,
  getAllFlatsWithUser,
  getAllRoomsWithUser,
  getAllUsers,
} from "../controllers/admin.controllers"

const router = express.Router()

router.get("/dashboard", isAuthenticated, authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), adminDashboardApi)

router.get("/user-details", isAuthenticated, authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), getAllUsers)

router.get(
  "/rooms-with-owner",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
  getAllRoomsWithUser,
)

router.get(
  "/flats-with-owner",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]),
  getAllFlatsWithUser,
)

export default router
