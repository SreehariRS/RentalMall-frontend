import { NextResponse } from "next/server";
import prisma from '@/app/libs/prismadb';
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/app/libs/pusher";

export async function GET(request: Request) {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
        return NextResponse.error();
    }

    const notifications = await prisma.notification.findMany({
        where: {
            userId: currentUser.id
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return NextResponse.json(notifications);
}

// Add POST method to create notifications with Pusher integration
export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        const body = await request.json();
        const { userId, message, type = "info", hostInfo } = body;
        
        if (!userId || !message) {
            return new NextResponse("Missing required fields", { status: 400 });
        }
        
        // Create the notification without the host field that's causing the error
        const notification = await prisma.notification.create({
            data: {
                userId,
                message,
                type
                // Removed the host field that was causing the error
            }
        });
        
        // Get the recipient user to get their email
        const recipient = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });
        
        if (recipient?.email) {
            // Trigger Pusher event for real-time notification
            await pusherServer.trigger(
                `user-${recipient.email}-notifications`,
                'notification:new',
                notification
            );
        }
        
        return NextResponse.json(notification);
    } catch (error) {
        console.error("CREATE_NOTIFICATION_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}