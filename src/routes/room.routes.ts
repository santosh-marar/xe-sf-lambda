import express from "express"
import {
  createRoom,
  deleteRoom,
  getAllRooms,
  getMyAllRooms,
  getPresignedUrls,
  getRoomById,
  updateRoom,
} from "../controllers/room.controllers"
import isAuthenticated, { authorizeRoles, USER_ROLES } from "../middlewares/auth.middlewares"

const router = express.Router()

router.post("/", isAuthenticated, authorizeRoles([USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]), createRoom)

router.get("/", getAllRooms)

router.get(
  "/my-rooms",
  isAuthenticated,
  authorizeRoles([USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]),
  getMyAllRooms,
)

// roomImagesGetPreSignedPostUrl

router.post(
  "/get-signed-url",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]),
  getPresignedUrls,
)

router.get("/:id", getRoomById)

router.put("/:id", isAuthenticated, authorizeRoles([USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]), updateRoom)

router.delete("/:id", isAuthenticated, authorizeRoles([USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]), deleteRoom)

export default router
