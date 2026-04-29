import mongoose from "mongoose"

const QuotationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String }, // uploaded file
  },
  { timestamps: true }
)

export default mongoose.models.Quotation ||
  mongoose.model("Quotation", QuotationSchema)