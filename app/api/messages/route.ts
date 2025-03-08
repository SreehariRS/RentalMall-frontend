import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        const body = await request.json();
        const { message, image, voice, conversationId } = body;

        if (!currentUser?.id || !currentUser?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const newMessage = await prisma.message.create({
            data: {
                body: message,
                image: image,
                voice: voice,
                conversation: {
                    connect: { id: conversationId }
                },
                sender: {
                    connect: { id: currentUser.id }
                }
            },
            include: {
                sender: true
            }
        });

        const updatedConversation = await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessageAt: new Date(),
                messages: {
                    connect: { id: newMessage.id }
                }
            },
            include: {
                users: true,
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        // Simplify the Pusher payload to avoid 413 error
        await pusherServer.trigger(conversationId, 'messages:new', {
            id: newMessage.id,
            body: newMessage.body,
            image: newMessage.image,
            voice: newMessage.voice,
            createdAt: newMessage.createdAt,
            sender: {
                id: newMessage.sender.id,
                name: newMessage.sender.name,
                email: newMessage.sender.email
            }
        });

        const lastMessage = updatedConversation.messages[0];
        updatedConversation.users.forEach((user) => {
            if (user.email) {
                pusherServer.trigger(user.email, "conversation:update", {
                    id: conversationId,
                    lastMessageAt: updatedConversation.lastMessageAt,
                    lastMessage: {
                        id: lastMessage.id,
                        body: lastMessage.body,
                        image: lastMessage.image,
                        voice: lastMessage.voice,
                        createdAt: lastMessage.createdAt
                    }
                });
            }
        });

        return NextResponse.json(newMessage);
    } catch (error: unknown) {
        console.log(error, "ERROR_MESSAGES");
        return new NextResponse("InternalError", { status: 500 });
    }
}