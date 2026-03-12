import * as bcrypt from "bcryptjs";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB...");

    // Setup Admin User
    const User = mongoose.model("User", new mongoose.Schema({
        username: { type: String, required: true, unique: true },
        password_hash: { type: String, required: true },
    }));

    const adminExists = await User.findOne({ username: "admin" });

    if (!adminExists) {
        const password_hash = await bcrypt.hash("admin123", 10);
        const admin = await User.create({ username: "admin", password_hash });
        console.log("Admin user created (admin / admin123)");

        // Create default settings for admin
        const Setting = mongoose.model("Setting", new mongoose.Schema({
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
            gmail_email: { type: String, default: "" },
            gmail_password: { type: String, default: "" },
            daily_email_limit: { type: Number, default: 200 },
            daily_leads_limit: { type: Number, default: 1000 },
            default_query: { type: String, default: 'site:myshopify.com "powered by shopify" inurl:collections' },
            email_subject: { type: String, default: "Quick idea to improve your Shopify store" },
            email_body: { type: String, default: `Hi,\n\nI noticed your Shopify store could improve design, speed, and conversions.\n\nI’m a Shopify developer and help businesses build faster and high-converting stores.\n\nIf you’d like, I can share quick suggestions.\n\nBest regards,\nMuhammad Noman` }
        }));

        await Setting.create({ user_id: admin._id });
        console.log("Default settings created for admin");
    } else {
        console.log("Admin user already exists");
    }

    process.exit();
}

seed().catch(console.error);
