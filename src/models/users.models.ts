import { Schema, Document, model, PaginateModel } from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"
import { USER_ROLES } from "../middlewares/auth.middlewares"

interface IUser {
  name: string
  email: string
  password: string
  phoneNumber: number
  userAvatarUrl?: string
  isVerified: boolean
  isEmailVerified: boolean
  roles: USER_ROLES[]
}

export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    unique: true,
    required: true,
  },
  userAvatarUrl: {
    type: String,
  },
  roles: {
    type: [String],
    default: [USER_ROLES.SPACE_PROVIDER],
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
    required: true,
  },
})

userSchema.plugin(mongoosePaginate)

const User = model<UserDocument, PaginateModel<UserDocument>>("User", userSchema, "users")

export default User
