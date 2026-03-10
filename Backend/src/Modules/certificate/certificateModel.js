
import mongoose, { Schema } from "mongoose"
import crypto from "crypto"

const certificateSchema = new Schema(
  {
    issuedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    name: {
      type: String,
      required: function () {
        return !this.issuedTo
      },
      trim: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      required: function () {
        return !this.issuedTo
      }
    },

    type: {
      type: String,
      enum: [
        "Membership",
        "Appointment",
        "Donation",
        "EventParticipation"
      ],
      required: true,
      index: true
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: function () {
        return this.type === "EventParticipation"
      },
      default: null,
      index: true
    },

    issueDate: {
      type: Date,
      default: Date.now
    },

    fileUrl: {
      type: String,
      default: null
    },

    filePublicId: {
      type: String,
      default: null
    },

    templateUsed: {
      type: String,
      default: "default"
    },

    status: {
      type: String,
      enum: ["GENERATED", "ISSUED", "REVOKED"],
      default: "GENERATED"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    certificateCode: {
      type: String,
      unique: true,
      index: true,
      default: () =>
        `CERT-${crypto.randomBytes(5).toString("hex").toUpperCase()}`
    }
  },
  { timestamps: true }
)

certificateSchema.index({ issuedTo: 1, type: 1 })
certificateSchema.index({ eventId: 1, issuedTo: 1 })

const Certificate = mongoose.model("Certificate", certificateSchema)

export default Certificate

