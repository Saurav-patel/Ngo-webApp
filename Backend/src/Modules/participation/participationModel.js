
import mongoose, { Schema } from "mongoose";

const participationSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["REGISTERED", "ATTENDED", "ABSENT"],
      default: "REGISTERED"
    },

    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      default: null
    }
  },
  { timestamps: true }
);

participationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const Participation = mongoose.model("Participation", participationSchema);

export {Participation}

