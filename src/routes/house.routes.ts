import express from "express"
import { createHouse, deleteHouse, getAllHouses, getHouseById, updateHouse } from "../controllers/house.controllers"
import isAuthenticated, { authorizeRoles, USER_ROLES } from "../middlewares/auth.middlewares"

const router = express.Router()

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
