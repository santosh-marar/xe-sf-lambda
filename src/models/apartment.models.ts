import mongoose, { Document, Schema, PaginateModel } from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"
import { COUNTRY, GENDER_PREFERENCE, LISTING_TYPE, SPACE_TYPES } from "./room.models"

export enum FURNISH_STATUS {
  FULL = "full",
  SEMI = "semi",
  PART = "part",
  NONE = "none",
}

// IApartment Interface
export interface IApartment extends Document {
  userId: mongoose.Types.ObjectId
  spaceType: SPACE_TYPES
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
  listingType: LISTING_TYPE
  noOfBedrooms: number
  noOfBathrooms: number
  noOfKitchens: number
  noOfParkingSpaces: string
  furnish: FURNISH_STATUS
  floor: number
  isAvailable: boolean
  isActive: boolean
}

export interface ApartmentDocument extends IApartment, Document {}

// Apartment Schema
const apartmentSchema = new Schema<ApartmentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    spaceType: { type: String, enum: Object.values(SPACE_TYPES), default: SPACE_TYPES.APARTMENT, required: true },
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
    listingType: { type: String, required: true, lowercase: true, trim: true },
    noOfBedrooms: { type: Number, required: true, min: 1 },
    noOfBathrooms: { type: Number, required: true, min: 1 },
    noOfKitchens: { type: Number, required: true, min: 1 },
    noOfParkingSpaces: { type: String, required: true, min: 1 },
    furnish: { type: String, required: true, lowercase: true, trim: true },
    floor: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

apartmentSchema.index({ city: 1 })
apartmentSchema.index({ chowk: "text" })
apartmentSchema.index({ fare: 1 })
apartmentSchema.index({ isAvailable: 1, isActive: 1 })

// Apply pagination plugin
apartmentSchema.plugin(mongoosePaginate)

const Apartment = mongoose.model<ApartmentDocument, PaginateModel<ApartmentDocument>>(
  "Apartment",
  apartmentSchema,
  "apartments",
)
export default Apartment
