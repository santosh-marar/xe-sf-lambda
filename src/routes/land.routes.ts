import express from "express"
import {
  createLand,
  deleteLand,
  getAllLands,
  getLandById,
  updateLand,
} from "../controllers/land.controllers"
import isAuthenticated, { authorizeRoles, USER_ROLES } from "../middlewares/auth.middlewares"

const router = express.Router()

router.post("/", isAuthenticated, authorizeRoles([USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]), createLand)

router.get("/", getAllLands)

router.get("/:id", getLandById)

router.put("/:id", isAuthenticated, authorizeRoles([USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]), updateLand)

router.delete("/:id", isAuthenticated, authorizeRoles([USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]), deleteLand)

export default router