import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        gmail_email: {
            type: String,
            default: "",
        },
        gmail_password: {
            type: String,
            default: "",
        },
        daily_email_limit: {
            type: Number,
            default: 200,
        },
        daily_leads_limit: {
            type: Number,
            default: 1000,
        },
        default_query: {
            type: String,
            default: 'site:myshopify.com "powered by shopify" inurl:collections',
        },
        email_subject: {
            type: String,
            default: "Quick idea to improve your Shopify store",
        },
        email_body: {
            type: String,
            default: `Hi,

I noticed your Shopify store could improve design, speed, and conversions.

I’m a Shopify developer and help businesses build faster and high-converting stores.

If you’d like, I can share quick suggestions.

Best regards,
Muhammad Noman`,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
