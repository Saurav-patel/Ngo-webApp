import mongoose, { Schema } from "mongoose"

const certificateSchema = new Schema(
  {
    issuedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // For external participants (non-registered)
    name: {
      type: String,
      required: function () {
        return !this.issuedTo
      }
    },

    email: {
      type: String,
      lowercase: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      required: function () {
        return !this.issuedTo
      }
    },

    // Certificate Type
    type: {
      type: String,
      enum: ["Membership", "Appointment", "Donation", "EventParticipation"],
      required: true
    },

    // If linked to an event
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: function () {
        return this.type === "EventParticipation"
      },
      default: null
    },

    // Date of issue
    issueDate: {
      type: Date,
      default: Date.now
    },

    // Cloudinary URLs
    fileUrl: {
      type: String,
      default: null
    },
    filePublicId: {
      type: String,
      default: null
    },

    // Design/template tracking
    templateUsed: {
      type: String,
      default: "default"
    },

    // Certificate lifecycle status
    status: {
      type: String,
      enum: ["generated", "issued", "revoked"],
      default: "generated"
    },

    // Admin or system user who generated it
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // Unique short code for public verification
    certificateCode: {
      type: String,
      unique: true,
      default: () =>
        `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }
  },
  { timestamps: true }
)

// 🔍 Useful indexes for faster queries
certificateSchema.index({ issuedTo: 1, type: 1 })
certificateSchema.index({ eventId: 1 })


const Certificate = mongoose.model("Certificate", certificateSchema)
export default Certificate
