"use client";

import { useRouter } from "next/navigation";
import { Conversation, Message, User } from "@prisma/client";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { FullConversationType } from "@/app/types";
import useotherUser from "@/app/hooks/useOtherUser";
import { useCallback, useEffect, useMemo, useState } from "react";
import Avatar from "@/app/components/Avatar";
import { pusherClient } from "@/app/libs/pusher";

interface ConversationBoxProps {
    data: FullConversationType;
    selected?: boolean;
}

function ConversationBox({ data, selected }: ConversationBoxProps) {
    const otherUser = useotherUser(data);
    const session = useSession();
    const router = useRouter();
    const [hasSeen, setHasSeen] = useState(true);

    const handleClick = useCallback(() => {
        router.push(`/conversations/${data.id}`);
    }, [data.id, router]);

    const lastMessage = useMemo(() => {
        const messages = data.messages || [];
        return messages[messages.length - 1];
    }, [data.messages]);

    const userEmail = useMemo(() => {
        return session.data?.user?.email;
    }, [session.data?.user?.email]);

    // Check if the current user has seen the last message
    useEffect(() => {
        if (!lastMessage || !userEmail) {
            setHasSeen(true);
            return;
        }

        const seenArray = lastMessage.seen || [];
        // Check if the current user's email exists in the seen array
        const hasUserSeen = seenArray.some((user) => user.email === userEmail);
        
        // Only show unseen indicator if the message wasn't sent by the current user
        if (lastMessage.sender?.email !== userEmail) {
            setHasSeen(hasUserSeen);
        } else {
            setHasSeen(true); // Always mark as seen if the current user sent it
        }
    }, [lastMessage, userEmail]);

    // Subscribe to pusher events for real-time updates
    useEffect(() => {
        if (!data.id || !userEmail) return;

        pusherClient.subscribe(data.id);
        
        // Handle message updates (when seen status changes)
        const messageUpdateHandler = (updatedMessage: any) => {
            if (updatedMessage.id === lastMessage?.id) {
                // Check if the current user's email is in the seen array
                const isMessageSeen = updatedMessage.seen.some(
                    (user: any) => user.email === userEmail
                );
                
                setHasSeen(isMessageSeen);
            }
        };

        pusherClient.bind('message:update', messageUpdateHandler);

        return () => {
            pusherClient.unsubscribe(data.id);
            pusherClient.unbind('message:update', messageUpdateHandler);
        };
    }, [data.id, userEmail, lastMessage]);

    const lastMessageText = useMemo(() => {
        if (lastMessage?.image) {
            return "Sent an Image";
        }
        if (lastMessage?.body) {
            return lastMessage.body;
        }
        return "Started a conversation";
    }, [lastMessage]);

    return (
        <div
            onClick={handleClick}
            className={clsx(
                `w-full relative flex items-center space-x-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer p-3`,
                selected ? "bg-neutral-100" : "bg-white"
            )}
        >
            <div className="relative">
                <Avatar src={otherUser?.image} />
                {/* Add the red dot indicator for unseen messages */}
                {!hasSeen && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border border-white"></span>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="focus:outline-none">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-md font-medium text-gray-900">
                            {data.name || otherUser.name}
                        </p>
                        {lastMessage?.createdAt && (
                            <p className="text-xs text-gray-400 font-light">
                                {format(new Date(lastMessage.createdAt), 'p')}
                            </p>
                        )}
                    </div>
                    <p className={clsx(`
                        truncate text-sm
                        `, hasSeen ? 'text-gray-500' : 'text-black font-medium')}>
                        {lastMessageText}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ConversationBox;