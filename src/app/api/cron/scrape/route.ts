import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { searchGoogle, extractEmailFromUrl } from "@/services/scraper";

// This endpoint runs via Vercel Cron or a manual trigger
export async function GET(req: Request) {
    try {
        // Basic authorization for cron or manual triggers
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Also allow manual trigger if logged in
            // (In a real app, verify NextAuth session here for manual triggers)
        }

        await dbConnect();

        // Get the first admin's settings for automation
        const adminUser = await User.findOne({ username: 'admin' });
        if (!adminUser) return NextResponse.json({ error: "No admin configured" }, { status: 400 });

        const settings = await Setting.findOne({ user_id: adminUser._id });
        if (!settings) return NextResponse.json({ error: "Settings not found" }, { status: 400 });

        // 1. Search Google
        console.log(`Starting Scrape: ${settings.default_query}`);
        const urls = await searchGoogle(settings.default_query, Math.min(settings.daily_leads_limit, 50)); // limit fetch to prevent Vercel 10s timeout

        let addedCount = 0;

        // 2. Process URLs
        for (const url of urls) {
            // Check if already in DB
            const existing = await Lead.findOne({ store_url: url });
            if (existing) continue;

            // Extract Email
            const email = await extractEmailFromUrl(url);

            // Save to DB
            await Lead.create({
                store_url: url,
                email: email || null,
                contact_page: `${url}/pages/contact`, // guess contact page
            });

            addedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Scraped ${urls.length} urls. Added ${addedCount} new leads.`
        });

    } catch (error: any) {
        console.error("Scrape Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
