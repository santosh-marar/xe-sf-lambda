import express from "express"
import {
  createHouse,
  deleteHouse,
  getAllHouses,
  getHouseById,
  updateHouse,
  getPresignedPostUrls,
} from "../controllers/house.controllers"
import isAuthenticated, { authorizeRoles, USER_ROLES } from "../middlewares/auth.middlewares"

const router = express.Router()

router.post(
  "/get-signed-url",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]),
  getPresignedPostUrls,
)

router.post("/", isAuthenticated, authorizeRoles([USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]), createHouse)

router.get("/", getAllHouses)

router.get("/:id", getHouseById)

router.put("/:id", isAuthenticated, authorizeRoles([USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]), updateHouse)

router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles([USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]),
  deleteHouse,
)

export default router
