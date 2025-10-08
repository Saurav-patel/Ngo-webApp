import mongoose, { Schema } from "mongoose"

const auditReportSchema = new Schema({
    year: { 
        type: Number, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['Work', 'Account'], 
        required: true 
    },
    fileUrl: { 
        type: String, 
        required: true 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    notes: { 
        type: String, 
        default: "" 
    }
}, { timestamps: true })


auditReportSchema.index({ year: 1, type: 1 })
auditReportSchema.index({ createdBy: 1 })


const AuditReport = mongoose.model("AuditReport", auditReportSchema)

export default AuditReport
