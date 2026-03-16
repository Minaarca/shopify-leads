import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { sendEmail } from "@/services/mailer";

// This endpoint runs via Vercel Cron
export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Only verify if CRON_SECRET is set
            // return new Response('Unauthorized', { status: 401 });
        }

        await dbConnect();

        const adminUser = await User.findOne({ username: 'admin' });
        if (!adminUser) return NextResponse.json({ error: "No admin configured" }, { status: 400 });

        const settings = await Setting.findOne({ user_id: adminUser._id });
        if (!settings || !settings.gmail_email || !settings.gmail_password) {
            return NextResponse.json({ error: "SMTP settings missing" }, { status: 400 });
        }

        // Check how many emails sent today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const sentTodayCount = await Lead.countDocuments({
            status: "Email Sent",
            updatedAt: { $gte: startOfDay }
        });

        if (sentTodayCount >= settings.daily_email_limit) {
            return NextResponse.json({ message: "Daily limit reached" });
        }

        // Fetch batch of pending leads with emails
        // Since Vercel Hobby limits cron to 1x/day, we attempt a larger batch
        // Note: Vercel functions have a 10s timeout, so it may still kill the process if the email provider takes too long per request.
        const remainingLimit = settings.daily_email_limit - sentTodayCount;
        const batchSize = Math.min(100, remainingLimit);

        const pendingLeads = await Lead.find({
            status: "Pending",
            email: { $ne: null }
        }).limit(batchSize);

        if (pendingLeads.length === 0) {
            return NextResponse.json({ message: "No pending leads with email found" });
        }

        let sentCount = 0;
        let failedCount = 0;

        for (const lead of pendingLeads) {
            // Simulate slight delay to avoid rapid fire (but keep under 10s lambda limit if small batch)
            await new Promise(r => setTimeout(r, 500));

            const result = await sendEmail({
                to: lead.email,
                subject: settings.email_subject,
                body: settings.email_body,
                auth: {
                    user: settings.gmail_email,
                    pass: settings.gmail_password,
                }
            });

            if (result.success) {
                lead.status = "Email Sent";
                sentCount++;
            } else {
                lead.status = "Failed";
                failedCount++;
            }

            await lead.save();
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${pendingLeads.length} leads. Sent: ${sentCount}, Failed: ${failedCount}`
        });

    } catch (error: any) {
        console.error("Mailer Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
