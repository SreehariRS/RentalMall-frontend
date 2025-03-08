import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(req: Request, { params }: { params: { userId: string } }) {
    try {
        const { userId } = params;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isRestricted: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ isRestricted: user.isRestricted });
    } catch {
        return NextResponse.json({ error: "Failed to fetch restriction status" }, { status: 500 });
    }
}