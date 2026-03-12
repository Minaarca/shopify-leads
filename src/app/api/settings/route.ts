import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";
import User from "@/models/User";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Find settings for the logged in user
        const settings = await Setting.findOne({ user_id: (session.user as any).id });

        if (!settings) {
            return NextResponse.json({ error: "Settings not found" }, { status: 404 });
        }

        // Don't send the raw password back to the client
        const { gmail_password, ...safeSettings } = settings.toObject();

        return NextResponse.json(safeSettings);
    } catch (error) {
        console.error("Settings GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();

        // Update settings
        // If password is sent as empty string or undefined, don't overwrite the existing one
        const updateData = { ...body };
        if (!updateData.gmail_password) {
            delete updateData.gmail_password;
        }

        const updatedSettings = await Setting.findOneAndUpdate(
            { user_id: (session.user as any).id },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedSettings) {
            return NextResponse.json({ error: "Settings not found to update" }, { status: 404 });
        }

        const { gmail_password, ...safeSettings } = updatedSettings.toObject();

        return NextResponse.json(safeSettings);
    } catch (error) {
        console.error("Settings PUT Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
