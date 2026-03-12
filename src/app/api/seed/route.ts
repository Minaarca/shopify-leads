import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Setting from "@/models/Setting";

export async function GET() {
    try {
        await dbConnect();

        const adminExists = await User.findOne({ username: "admin" });

        if (!adminExists) {
            const password_hash = await bcrypt.hash("admin123", 10);
            const admin = await User.create({ username: "admin", password_hash });

            // Create default settings for admin
            await Setting.create({
                user_id: admin._id,
                gmail_email: "",
                gmail_password: "",
                daily_email_limit: 200,
                daily_leads_limit: 1000,
                default_query: 'site:myshopify.com "powered by shopify" inurl:collections',
                email_subject: "Quick idea to improve your Shopify store",
                email_body: "Hi,\n\nI noticed your Shopify store could improve design, speed, and conversions.\n\nI’m a Shopify developer and help businesses build faster and high-converting stores.\n\nIf you’d like, I can share quick suggestions.\n\nBest regards,\nMuhammad Noman"
            });

            return NextResponse.json({ message: "Admin user created successfully! You can now log in with admin / admin123" });
        }

        return NextResponse.json({ message: "Admin user already exists. You can log in with admin / admin123" });
    } catch (error: any) {
        console.error("Seed Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
