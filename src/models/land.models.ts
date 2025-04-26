import mongoose, { Document, PaginateModel, Schema } from "mongoose"
import { LISTING_PURPOSE, SPACE_CATEGORIES, SPACE_TYPES, COUNTRY } from "./room.models"
import mongoosePaginate from "mongoose-paginate-v2"

export interface ILand extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  country: string
  descriptionOfSpace: string
  spaceImagesUrl: string[]
  videoUrl: string
  listingType: LISTING_PURPOSE
  spaceType: SPACE_TYPES
  spaceCategories: SPACE_CATEGORIES
  city: string
  chowk: string
  municipality: string
  wardNo: number
  totalArea: string
  dimension: string
  roadType: string
  propertyFace: string
  roadAccess: string
  plotNumber: string
  nearByLocation?: {
    landmark: string
    hospital: string
    school: string
    park: string
    market: string
    policeStation: string
    fireStation: string
    bank: string
    postOffice: string
    atm: string
    library: string
    pharmacy: string
    wardOffice: string
    restaurant: string
    busStation: string
    cinemaHall: string
  }
  fare: number
  isFareNegotiable: boolean
  isAvailable: boolean
  isExclusive: boolean
}

export interface LandDocument extends ILand, Document {}

const landSchema = new Schema<ILand>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    country: {
      type: String,
      enum: Object.values(COUNTRY),
      default: COUNTRY.NEPAL,
      required: true,
    },
    title: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    descriptionOfSpace: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    spaceImagesUrl: [{ type: String }],
    videoUrl: {
      type: String,
      trim: true,
    },
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
    municipality: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    wardNo: {
      type: Number,
      required: true,
    },
    totalArea: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    dimension: {
      type: String,
      lowercase: true,
      trim: true,
    },
    roadType: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    propertyFace: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    roadAccess: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    plotNumber: {
      type: String,
      required: true,
    },
    nearByLocation: {
      landmark: {
        type: String,
        lowercase: true,
        trim: true,
      },
      hospital: {
        type: String,
        lowercase: true,
        trim: true,
      },
      school: {
        type: String,
        uppercase: true,
        trim: true,
      },
      park: {
        type: String,
        lowercase: true,
        trim: true,
      },
      market: {
        type: String,
        required: true,
        trim: true,
      },
      policeStation: {
        type: String,
        lowercase: true,
        trim: true,
      },
      fireStation: {
        type: String,
        lowercase: true,
        trim: true,
      },
      bank: {
        type: String,
        lowercase: true,
        trim: true,
      },
      postOffice: {
        type: String,
        lowercase: true,
        trim: true,
      },
      atm: {
        type: String,
        trim: true,
      },
      library: {
        type: String,
        lowercase: true,
        trim: true,
      },
      pharmacy: {
        type: String,
        lowercase: true,
        trim: true,
      },
      wardOffice: {
        type: String,
        lowercase: true,
        trim: true,
      },
      restaurant: {
        type: String,
        lowercase: true,
        trim: true,
      },
      busStation: {
        type: String,
        lowercase: true,
        trim: true,
      },
      cinemaHall: {
        type: String,
        lowercase: true,
        trim: true,
      },
    },
    fare: {
      type: Number,
      min: 0,
      required: true,
    },
    isFareNegotiable: {
      type: Boolean,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isExclusive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

landSchema.index({ city: 1 })
landSchema.index({ chowk: "text" })
landSchema.index({ fare: 1 })
landSchema.index({ isAvailable: 1, isActive: 1 })

// Apply pagination plugin
landSchema.plugin(mongoosePaginate)

const Land = mongoose.model<LandDocument, PaginateModel<LandDocument>>("Land", landSchema)
export default Land
