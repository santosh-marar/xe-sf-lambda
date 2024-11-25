import { Router } from "express"
import {
  createApartment,
  deleteApartment,
  getAllApartments,
  getApartmentById, getMyAllApartments,
  getSignedUrlForApartmentImages,
  updateApartment,
} from "../controllers/apartment.controllers"
import isAuthenticated, { authorizeRoles, USER_ROLES } from "../middlewares/auth.middlewares"

const apartmentRouter = Router()

// Create a new apartment
apartmentRouter.post(
  "/",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]),
  createApartment,
)

apartmentRouter.get(
  "/my-apartments",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SPACE_BROKER, USER_ROLES.SPACE_PROVIDER]),
  getMyAllApartments
)

// Get all apartments
apartmentRouter.get("/", getAllApartments)

// Get a single apartment
apartmentRouter.get("/:id", getApartmentById)

// Update a apartment
apartmentRouter.put(
  "/:id",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]),
  updateApartment,
)

// Delete a apartment
apartmentRouter.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]),
  deleteApartment,
)

// Get apartments signedUrl
apartmentRouter.post(
  "/get-signed-url",
  isAuthenticated,
  authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER]),
  getSignedUrlForApartmentImages,
)

export default apartmentRouter
