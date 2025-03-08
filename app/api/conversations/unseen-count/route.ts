import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Since "seen" functionality is removed, return 0 for unseen count
        return NextResponse.json({ count: 0 });
    } catch (error) {
        console.error("UNSEEN_MESSAGES_COUNT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}