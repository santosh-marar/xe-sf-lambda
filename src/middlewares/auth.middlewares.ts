import jwt, { JwtPayload } from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

// Define user roles as a TypeScript enum for better type safety
enum USER_ROLES {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
  SPACE_PROVIDER = "space_provider",
  SPACE_BROKER = "space_broker",
}

// Define types
interface DecodedToken extends JwtPayload {
  user_id: string
  roles: USER_ROLES[]
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      _id: string
      roles: USER_ROLES[]
    }
  }
}

// Middleware to check if the user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization || req.headers.Authorization

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
      if (err) {
        console.error(err)
        if (err.name === "TokenExpiredError") {
          res.status(401).json({ message: "Unauthorized: Token expired" })
        } else {
          res.status(403).json({ message: "Forbidden: Invalid token" })
        }
        return // Ensure callback exits after sending response
      }

      // If token is valid
      const decodedToken = decoded as DecodedToken
      req.user = {
        _id: decodedToken.user_id,
        roles: decodedToken.roles,
      }

      next() // Proceed to the next middleware
    })
  } else {
    res.status(401).json({ message: "Unauthorized: Missing or invalid token" })
  }
}

export default isAuthenticated

// Define role hierarchy for access control
const roleHierarchy: Record<string, USER_ROLES[]> = {
  [USER_ROLES.SUPER_ADMIN]: [
    USER_ROLES.ADMIN,
    USER_ROLES.USER,
    USER_ROLES.SPACE_PROVIDER,
    USER_ROLES.GUEST,
    USER_ROLES.SPACE_BROKER,
  ],
  [USER_ROLES.ADMIN]: [USER_ROLES.USER, USER_ROLES.SPACE_PROVIDER, USER_ROLES.SPACE_BROKER, USER_ROLES.GUEST],
  [USER_ROLES.SPACE_PROVIDER]: [],
  [USER_ROLES.USER]: [],
  [USER_ROLES.GUEST]: [],
}

// authorizeRoles Middleware
const authorizeRoles = (allowedRoles: USER_ROLES[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { roles } = req.user || { roles: [] }

    // Check if the user has any of the allowed roles or their sub-roles
    const hasAccess = roles.some((role) => {
      if (allowedRoles.includes(role as USER_ROLES)) {
        return true
      }

      // Check sub-roles hierarchy
      const subRoles = roleHierarchy[role as USER_ROLES] || []
      return allowedRoles.some((allowedRole) => subRoles.includes(allowedRole))
    })

    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" })
    }

    return next() // Proceed if access is granted
  }
}

export { authorizeRoles, USER_ROLES }
