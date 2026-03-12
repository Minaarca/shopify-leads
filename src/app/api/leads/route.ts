import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        let query = {};

        if (status) {
            if (status !== 'All') {
                query = { status };
            }
        }

        await dbConnect();
        const leads = await Lead.find(query).sort({ date_collected: -1 });

        return NextResponse.json(leads);
    } catch (error) {
        console.error("Leads GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { store_url, email, contact_page } = body;

        if (!store_url) {
            return NextResponse.json({ error: "store_url is required" }, { status: 400 });
        }

        await dbConnect();

        // Check if exists
        const existing = await Lead.findOne({ store_url });
        if (existing) {
            return NextResponse.json({ error: "Lead already exists" }, { status: 409 });
        }

        const newLead = await Lead.create({
            store_url,
            email: email || null,
            contact_page: contact_page || null,
        });

        return NextResponse.json(newLead, { status: 201 });
    } catch (error) {
        console.error("Leads POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
