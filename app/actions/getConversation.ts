import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const getConversations = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        console.log("No current user found");
        return [];
    }
    console.log("Current user ID:", currentUser.id);
    try {
        const conversations = await prisma.conversation.findMany({
            orderBy: {
                lastMessageAt: "desc",
            },
            where: {
                userIds: {
                    has: currentUser.id,
                },
            },
            include: {
                users: true,
                messages: {
                    include: {
                        sender: true,
                        seen: true,
                    },
                },
            },
        });
        console.log("Fetched conversations:", conversations);
        return conversations;
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }
};

export default getConversations;