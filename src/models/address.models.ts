import mongoose, { Document, Schema } from "mongoose"

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId
  country: string
  state: string
  city: string
  chowk: string
  street: string
  houseNumber: string
  zipCode: string
  isDefault?: boolean
}

const addressSchema = new Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    country: {
      type: String,
      default: "nepal",
      required: true,
      lowercase: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    chowk: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    street: {
      type: String,
      lowercase: true,
      trim: true,
    },
    houseNumber: {
      type: String,
      lowercase: true,
      trim: true,
    },
    zipCode: {
      type: String,
      lowercase: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

const Address = mongoose.model<IAddress>("Address", addressSchema)
export default Address
