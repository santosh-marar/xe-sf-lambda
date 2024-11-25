import express, { Router } from "express"
import { getAddressById, updateAddress, deleteAddress, getAllAddressesWithUser, createAddress } from "../controllers/address.controllers"
import isAuthenticated, { authorizeRoles, USER_ROLES } from "../middlewares/auth.middlewares"

const router: Router = express.Router()

router.post("/", isAuthenticated, createAddress)

router.get("/addresses-with-user", isAuthenticated, authorizeRoles([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]), getAllAddressesWithUser)

router.get("/:id", isAuthenticated, getAddressById)

router.put("/:id", isAuthenticated, updateAddress)

router.delete("/:id", isAuthenticated, deleteAddress)

export default router
