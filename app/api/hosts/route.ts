import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

// Get all hosts
export async function GET() {
    try {
        const hosts = await prisma.user.findMany({
            where: {
                listings: { some: {} }, // Users with at least one listing
            },
            select: {
                id: true,
                name: true,
                email: true,
                isRestricted: true, // New field for restriction status
                listings: {
                    select: { id: true }, // Count listings
                },
            },
        });

        return NextResponse.json(
            hosts.map(host => ({
                id: host.id,
                name: host.name || "Unnamed Host",
                email: host.email,
                isRestricted: host.isRestricted,
                listingCount: host.listings.length,
            }))
        );
    } catch {
        return NextResponse.json({ error: "Failed to fetch hosts" }, { status: 500 });
    }
}

// Toggle host restriction
export async function PATCH(req: Request) {
    try {
        const { hostId, isRestricted } = await req.json();

        if (!hostId) {
            return NextResponse.json({ error: "Host ID is required" }, { status: 400 });
        }

        const updatedHost = await prisma.user.update({
            where: { id: hostId },
            data: { isRestricted },
        });

        return NextResponse.json({ success: true, isRestricted: updatedHost.isRestricted });
    } catch {
        return NextResponse.json({ error: "Failed to update host restriction" }, { status: 500 });
    }
}