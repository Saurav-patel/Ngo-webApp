import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        default: ""
    },
    fileUrl: [{
    url: { type: String },
    publicId: { type: String }
    }],
    uploadedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { 
    timestamps: true

})

const Document = mongoose.model("Document", documentSchema)
export default Document