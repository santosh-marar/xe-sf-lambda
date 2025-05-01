import { Router } from "express"
import {
  createFlat,
  deleteFlat,
  getAllFlats,
  getFlatById,
  getMyAllFlats,
  getSignedUrlForFlatImages,
  updateFlat,
} from "../controllers/flat.controllers"
import isAuthenticated, { authorizeRoles, USER_ROLES } from "../middlewares/auth.middlewares"

const flatRouter = Router()

// Create a new flat
flatRouter.post(
  "/",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]),
  createFlat,
)

flatRouter.get(
  "/my-flats",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SPACE_BROKER, USER_ROLES.SPACE_PROVIDER]),
  getMyAllFlats,
)

// Get all flats
flatRouter.get("/", getAllFlats)

// Get a single flat
flatRouter.get("/:id", getFlatById)

// Update a flat
flatRouter.put(
  "/:id",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]),
  updateFlat,
)

// Delete a flat
flatRouter.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]),
  deleteFlat,
)

// Get flats signedUrl
flatRouter.post(
  "/get-signed-url",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]),
  getSignedUrlForFlatImages,
)

export default flatRouter
