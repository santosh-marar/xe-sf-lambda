import mongoose, { Document, Schema, PaginateModel } from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"

export enum SPACE_TYPES {
  ROOM = "room",
  APARTMENT = "apartment",
}

// Enums
export enum GENDER_PREFERENCE {
  GIRLS_ONLY = "girlsOnly",
  FOR_ALL = "forAll",
  BOYS_ONLY = "boysOnly",
  FAMILY_AND_GIRLS_ONLY = "familyAndGirlsOnly",
  WORKING_PROFESSIONAL_AND_GIRLS_AND_FAMILY_ONLY = "workingProfessionalAndGirlsAndFamilyOnly",
}

export enum COUNTRY {
  NEPAL = "nepal",
  INDIA = "india",
}

export enum LISTING_TYPE {
  RENT = "rent",
  SALE = "sale",
}

// IRoom Interface
export interface IRoom extends Document {
  userId: mongoose.Types.ObjectId
  spaceType: SPACE_TYPES
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
  listingType: LISTING_TYPE
  isAvailable?: boolean
}

export interface RoomDocument extends IRoom, Document {}

// Room Schema
const roomSchema = new Schema<RoomDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    spaceType: { type: String, enum: Object.values(SPACE_TYPES), default: SPACE_TYPES.ROOM, required: true },
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
    listingType: { type: String, enum: Object.values(LISTING_TYPE), default: LISTING_TYPE.RENT, required: true },
    isAvailable: { type: Boolean, default: true },
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
