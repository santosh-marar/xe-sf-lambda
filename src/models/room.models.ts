import mongoose, { Document, Schema, PaginateModel } from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"

export enum SPACE_CATEGORIES {
  ROOM = "room",
  APARTMENT = "apartment",
  HOUSE = "house",
  FLAT = "flat",
  LAND = "land",
}

export enum SPACE_TYPES {
  COMMERCIAL = "commercial",
  RESIDENTIAL = "residential",
  "SEMI-RESIDENTIAL" = "semi-residential",
  "MIXED-USE" = "mixed-use",
}

// Enums
export enum GENDER_PREFERENCE {
  GIRLS_ONLY = "girlsOnly",
  FOR_ALL = "forAll",
  BOYS_ONLY = "boysOnly",
  FAMILY_ONLY = "familyOnly",
  FAMILY_AND_GIRLS_ONLY = "familyAndGirlsOnly",
  WORKING_PROFESSIONAL_AND_GIRLS_AND_FAMILY_ONLY = "workingProfessionalAndGirlsAndFamilyOnly",
}

export enum COUNTRY {
  NEPAL = "nepal",
  INDIA = "india",
}

export enum LISTING_PURPOSE {
  RENT = "rent",
  SALE = "sale",
}

// IRoom Interface
export interface IRoom extends Document {
  userId: mongoose.Types.ObjectId
  spaceCategories: SPACE_CATEGORIES
  country: COUNTRY
  district: string
  city: string
  chowk: string
  street?: string
  homeNumber?: string
  spaceImagesUrl?: string[]
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
  genderPreference?: GENDER_PREFERENCE
  isSpaceProviderLiving?: boolean
  descriptionOfSpace: string
  rulesOfLiving: string
  phoneNumber: number
  fare: number
  nearPopularPlace: string
  listingType: LISTING_PURPOSE
  spaceType: SPACE_TYPES
  isAvailable?: boolean
  isExclusive?: boolean
}

export interface RoomDocument extends IRoom, Document {}

// Room Schema
const roomSchema = new Schema<RoomDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    country: { type: String, enum: Object.values(COUNTRY), default: COUNTRY.NEPAL, lowercase: true, trim: true },
    district: { type: String, required: true, lowercase: true, trim: true },
    city: { type: String, required: true, lowercase: true, trim: true },
    chowk: { type: String, required: true, lowercase: true, trim: true },
    street: { type: String, trim: true, lowercase: true },
    homeNumber: { type: String, trim: true, lowercase: true },
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
    genderPreference: { type: String, enum: Object.values(GENDER_PREFERENCE) },
    isSpaceProviderLiving: { type: Boolean, default: false },
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
    isAvailable: { type: Boolean, default: true },
    isExclusive: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// roomSchema.index({ city: 1 })
// roomSchema.index({ chowk: "text" })
// roomSchema.index({ fare: 1 })
// roomSchema.index({ isAvailable: 1, isActive: 1 })

// Apply pagination plugin
roomSchema.plugin(mongoosePaginate)

const Room = mongoose.model<RoomDocument, PaginateModel<RoomDocument>>("Room", roomSchema, "rooms")
export default Room
