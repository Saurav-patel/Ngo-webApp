
import mongoose, { Schema } from "mongoose"

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: "",
      trim: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.startDate
        },
        message: "End date must be after start date"
      }
    },

    location: {
      type: String,
      default: "",
      trim: true
    },

    status: {
      type: String,
      enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
      index: true
    },

    photos: [
      {
        url: {
          type: String
        },
        publicId: {
          type: String
        }
      }
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true }
)

eventSchema.index({ startDate: 1 })
eventSchema.index({ endDate: 1 })

eventSchema.pre("save", function (next) {
  const now = new Date()

  if (this.status !== "CANCELLED") {
    if (now < this.startDate) {
      this.status = "UPCOMING"
    } else if (now >= this.startDate && now <= this.endDate) {
      this.status = "ONGOING"
    } else if (now > this.endDate) {
      this.status = "COMPLETED"
    }
  }

  next()
})

const Event = mongoose.model("Event", eventSchema)

export default Event

