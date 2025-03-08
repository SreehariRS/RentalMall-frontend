import { NextResponse } from "next/server";
import prisma from '@/app/libs/prismadb';
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Find all conversations for the current user
        const conversations = await prisma.conversation.findMany({
            where: {
                userIds: {
                    has: currentUser.id
                }
            },
            include: {
                messages: {
                    include: {
                        seen: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        });

        // Count conversations with unseen messages
        let unseenCount = 0;
        
        conversations.forEach(conversation => {
            if (conversation.messages.length > 0) {
                const lastMessage = conversation.messages[0];
                
                // Check if the current user has seen the last message
                const hasUserSeen = lastMessage.seen.some(user => user.id === currentUser.id);
                
                // If sender is not the current user and the message has not been seen
                if (lastMessage.senderId !== currentUser.id && !hasUserSeen) {
                    unseenCount++;
                }
            }
        });

        return NextResponse.json({ count: unseenCount });
    } catch (error) {
        console.error("UNSEEN_MESSAGES_COUNT_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}