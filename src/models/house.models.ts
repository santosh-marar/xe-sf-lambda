import mongoose, { Document, PaginateModel, Schema } from "mongoose"
import { LISTING_PURPOSE, SPACE_CATEGORIES, SPACE_TYPES, COUNTRY } from "./room.models"
import { FURNISH_STATUS } from "./flat.models"
import mongoosePaginate from "mongoose-paginate-v2"

export interface IHouse extends Document {
  userId: mongoose.Types.ObjectId
  country: string
  title: string
  descriptionOfSpace: string
  spaceImagesUrl: string[]
  videoUrl: string
  phoneNumber: number
  listingType: LISTING_PURPOSE
  spaceType: SPACE_TYPES
  spaceCategories: SPACE_CATEGORIES
  city: string
  chowk: string
  municipality: string
  wardNo: number
  totalArea: string
  buildUpArea: string
  noOfBedrooms: number
  noOfBathrooms: number
  noOfKitchens: number
  noOfFloors: number
  noOfLivingRooms: number
  noOfParkingSpaces: number
  buildYear: number
  furnish: FURNISH_STATUS
  dimension: string
  roadType: string
  propertyFace: string
  roadAccess: string
  plotNumber: string
  facilities: {
    securityStaff?: boolean
    elevator?: boolean
    maintenances?: boolean
    kidsPlayGround?: boolean
    electricityBackup?: boolean
    cafeteria?: boolean
    waterWell?: boolean
    wifi?: boolean
    washingMachine?: boolean
    TVCable?: boolean
    swimmingPool?: boolean
    modularKitchen?: boolean
    microwave?: boolean
    gym?: boolean
    cctv?: boolean
    garden?: boolean
    fencing?: boolean
    balcony?: boolean
    ac?: boolean
    waterTank?: boolean
    waterSupply?: boolean
    drainage?: boolean
    jacuzzi?: boolean
    garage?: boolean
    lawn?: boolean
  }
  nearByLocation?: {
    housemark?: string
    hospital?: string
    school?: string
    park?: string
    market?: string
    policeStation?: string
    fireStation?: string
    bank?: string
    postOffice?: string
    atm?: string
    library?: string
    pharmacy?: string
    wardOffice?: string
    restaurant?: string
    busStation?: string
    cinemaHall?: string
  }
  fare: number
  isFareNegotiable: boolean
  isAvailable: boolean
  isExclusive: boolean
}

export interface HouseDocument extends IHouse, Document {}

const houseSchema = new Schema<IHouse>(
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
    phoneNumber: {
      type: Number,
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
    buildUpArea: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    noOfBedrooms: {
      type: Number,
      required: true,
    },
    noOfBathrooms: {
      type: Number,
      required: true,
    },
    noOfKitchens: {
      type: Number,
      required: true,
    },
    buildYear: {
      type: Number,
      required: true,
    },
    furnish: {
      type: String,
      enum: Object.values(FURNISH_STATUS),
      default: FURNISH_STATUS.FULL,
      required: true,
    },
    noOfFloors: {
      type: Number,
      required: true,
    },
    noOfLivingRooms: {
      type: Number,
      required: true,
    },
    noOfParkingSpaces: {
      type: Number,
      required: true,
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
    facilities: {
      securityStaff: {
        type: Boolean,
        default: false,
      },
      elevator: {
        type: Boolean,
        default: false,
      },
      maintenances: {
        type: Boolean,
        default: false,
      },
      kidsPlayGround: {
        type: Boolean,
        default: false,
      },
      electricityBackup: {
        type: Boolean,
        default: false,
      },
      cafeteria: {
        type: Boolean,
        default: false,
      },
      washingMachine: {
        type: Boolean,
        default: false,
      },
      TVCable: {
        type: Boolean,
        default: false,
      },
      swimmingPool: {
        type: Boolean,
        default: false,
      },
      modularKitchen: {
        type: Boolean,
        default: false,
      },
      microwave: {
        type: Boolean,
        default: false,
      },
      gym: {
        type: Boolean,
        default: false,
      },
      cctv: {
        type: Boolean,
        default: false,
      },
      garden: {
        type: Boolean,
        default: false,
      },
      fencing: {
        type: Boolean,
        default: false,
      },
      balcony: {
        type: Boolean,
        default: false,
      },
      ac: {
        type: Boolean,
        default: false,
      },
      waterTank: {
        type: Boolean,
        default: false,
      },
      waterSupply: {
        type: Boolean,
        default: false,
      },
      drainage: {
        type: Boolean,
        default: false,
      },
      jacuzzi: {
        type: Boolean,
        default: false,
      },
      garage: {
        type: Boolean,
        default: false,
      },
      lawn: {
        type: Boolean,
        default: false,
      },
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

houseSchema.plugin(mongoosePaginate)

// houseSchema.index({ city: 1 })
// houseSchema.index({ chowk: "text" })
// houseSchema.index({ fare: 1 })
// houseSchema.index({ isAvailable: 1, isActive: 1 })

const House = mongoose.model<HouseDocument, PaginateModel<HouseDocument>>("House", houseSchema)
export default House
