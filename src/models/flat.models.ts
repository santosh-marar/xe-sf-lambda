import mongoose, { Document, Schema, PaginateModel } from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"
import { COUNTRY, GENDER_PREFERENCE, LISTING_PURPOSE, SPACE_CATEGORIES, SPACE_TYPES } from "./room.models"

export enum FURNISH_STATUS {
  FULL = "full",
  SEMI = "semi",
  PART = "part",
  NONE = "none",
}

// IFlat Interface
export interface IFlat extends Document {
  userId: mongoose.Types.ObjectId
  spaceCategories: SPACE_CATEGORIES
  country: string
  district: string
  city: string
  chowk: string
  street: string
  houseNumber: string
  spaceImagesUrl: string[]
  facility: {
    water?: boolean
    table?: boolean
    chair?: boolean
    clothesHanger?: boolean
    bed?: boolean
    fan?: boolean
    wifi?: boolean
    parking?: string
  }
  genderPreference: string
  isSpaceProviderLiving: boolean
  descriptionOfSpace: string
  rulesOfLiving: string
  phoneNumber: number
  fare: number
  nearPopularPlace: string
  listingType: LISTING_PURPOSE
  spaceType: SPACE_TYPES
  noOfBedrooms: number
  noOfBathrooms: number
  noOfKitchens: number
  noOfParkingSpaces: string
  furnish: FURNISH_STATUS
  floor: number
  isAvailable: boolean
  isExclusive: boolean
}

export interface FlatDocument extends IFlat, Document {}

// Flat Schema
const flatSchema = new Schema<FlatDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    country: { type: String, required: true, lowercase: true, trim: true, default: COUNTRY.NEPAL },
    district: { type: String, lowercase: true, trim: true },
    city: { type: String, required: true, lowercase: true, trim: true },
    chowk: { type: String, required: true, lowercase: true, trim: true },
    street: { type: String, lowercase: true, trim: true },
    houseNumber: { type: String, lowercase: true, trim: true },
    spaceImagesUrl: [{ type: String }],
    facility: {
      water: { type: Boolean, default: false },
      table: { type: Boolean, default: false },
      chair: { type: Boolean, default: false },
      clothesHanger: { type: Boolean, default: false },
      bed: { type: Boolean, default: false },
      fan: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      parking: { type: String },
    },
    genderPreference: { type: String, required: true, lowercase: true, trim: true, default: GENDER_PREFERENCE.FOR_ALL },
    isSpaceProviderLiving: { type: Boolean, default: true },
    descriptionOfSpace: { type: String, required: true, lowercase: true, trim: true },
    rulesOfLiving: { type: String, required: true, lowercase: true, trim: true },
    phoneNumber: { type: Number, required: true },
    fare: { type: Number, required: true, min: 0 },
    nearPopularPlace: { type: String, required: true, lowercase: true, trim: true },
    listingType: {
      type: String,
      enum: Object.values(LISTING_PURPOSE),
      default: LISTING_PURPOSE.RENT,
      required: true,
    },
    spaceType: {
      type: String,
      enum: Object.values(SPACE_TYPES),
      default: SPACE_TYPES.COMMERCIAL,
      required: true,
    },
    spaceCategories: {
      type: String,
      enum: Object.values(SPACE_CATEGORIES),
      default: SPACE_CATEGORIES.LAND,
      required: true,
    },
    noOfBedrooms: { type: Number, required: true, min: 1 },
    noOfBathrooms: { type: Number, required: true, min: 0 },
    noOfKitchens: { type: Number, required: true, min: 0 },
    noOfParkingSpaces: { type: String, required: true, min: 1 },
    furnish: { type: String, required: true, lowercase: true, trim: true },
    floor: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isExclusive: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// flatSchema.index({ city: 1 })
// flatSchema.index({ chowk: "text" })
// flatSchema.index({ fare: 1 })
// flatSchema.index({ isAvailable: 1, isActive: 1 })

// Apply pagination plugin
flatSchema.plugin(mongoosePaginate)

const Flat = mongoose.model<FlatDocument, PaginateModel<FlatDocument>>("Flat", flatSchema, "flats")
export default Flat
