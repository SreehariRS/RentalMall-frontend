"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { FullConversationType } from "@/app/types";
import useotherUser from "@/app/hooks/useOtherUser";
import { useCallback, useMemo } from "react";
import Avatar from "@/app/components/Avatar";

interface ConversationBoxProps {
    data: FullConversationType;
    selected?: boolean;
}

function ConversationBox({ data, selected }: ConversationBoxProps) {
    const otherUser = useotherUser(data);
    const session = useSession();
    const router = useRouter();

    const handleClick = useCallback(() => {
        router.push(`/conversations/${data.id}`);
    }, [data.id, router]);

    const lastMessage = useMemo(() => {
        const messages = data.messages || [];
        return messages[messages.length - 1];
    }, [data.messages]);

    const lastMessageText = useMemo(() => {
        if (lastMessage?.image) {
            return "Sent an Image";
        }
        if (lastMessage?.voice) {
            return "Sent an Audio";
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
            <div>
                <Avatar src={otherUser?.image} />
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
                    <p className="truncate text-sm text-gray-500">
                        {lastMessageText}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ConversationBox;