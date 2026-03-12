import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
    {
        store_url: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: false,
        },
        contact_page: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            enum: ["Pending", "Email Sent", "Failed"],
            default: "Pending",
        },
        date_collected: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
