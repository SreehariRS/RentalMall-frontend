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
                sender: true // Ensure sender includes all fields (e.g., image)
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
                    orderBy: { createdAt: 'desc' },
                    include: { sender: true }
                }
            }
        });

        // Trigger new message event with full sender data
        await pusherServer.trigger(conversationId, 'messages:new', {
            id: newMessage.id,
            body: newMessage.body,
            image: newMessage.image,
            voice: newMessage.voice,
            createdAt: newMessage.createdAt,
            sender: {
                id: newMessage.sender.id,
                name: newMessage.sender.name,
                email: newMessage.sender.email,
                image: newMessage.sender.image // Explicitly include image
            }
        });

        // Trigger conversation update with full message data
        const lastMessage = updatedConversation.messages[0];
        updatedConversation.users.forEach((user) => {
            if (user.email) {
                pusherServer.trigger(user.email, "conversation:update", {
                    id: conversationId,
                    lastMessageAt: updatedConversation.lastMessageAt,
                    messages: [{
                        id: lastMessage.id,
                        body: lastMessage.body,
                        image: lastMessage.image,
                        voice: lastMessage.voice,
                        createdAt: lastMessage.createdAt,
                        sender: {
                            id: lastMessage.sender.id,
                            name: lastMessage.sender.name,
                            email: lastMessage.sender.email,
                            image: lastMessage.sender.image // Explicitly include image
                        }
                    }]
                });
            }
        });

        return NextResponse.json(newMessage);
    } catch (error: unknown) {
        console.log(error, "ERROR_MESSAGES");
        return new NextResponse("InternalError", { status: 500 });
    }
}