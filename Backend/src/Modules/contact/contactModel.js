// src/models/contactRequest.model.js
import mongoose from "mongoose"

const contactRequestSchema = new mongoose.Schema(
  {
    // If user is logged in, you can attach it; otherwise null
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
       match:
             /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },

    phone: {
      type: String,
      trim: true
    },

    // Why they’re contacting you
    reason: {
      type: String,
      enum: ["volunteering", "donation", "partnership", "event", "other"],
      default: "other"
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "closed"],
      default: "pending"
    },

    // For admin notes later if you want
    adminNotes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

export const ContactRequest = mongoose.model(
  "ContactRequest",
  contactRequestSchema
)
