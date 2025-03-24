"use client";

import useConversation from "@/app/hooks/useConversation";
import { FullConversationType } from "@/app/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { MdOutlineGroupAdd } from "react-icons/md";
import ConversationBox from "./ConversationBox";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";

interface ConversationListProps {
    initialItems: FullConversationType[];
}

function ConversationList({ initialItems }: ConversationListProps) {
    const session = useSession();
    const [items, setItems] = useState(initialItems);
    const router = useRouter();

    const { conversationId, isOpen } = useConversation();
    const pusherKey = useMemo(() => {
        return session.data?.user?.email;
    }, [session.data?.user?.email]);

    useEffect(() => {
        if (!pusherKey) {
            return;
        }
        pusherClient.subscribe(pusherKey);

        const newHandler = (conversation: FullConversationType) => {
            setItems((current) => {
                if (find(current, { id: conversation.id })) {
                    return current;
                }
                return [conversation, ...current];
            });
        };

        const updateHandler = (conversation: FullConversationType) => {
            setItems((current) =>
                current.map((currentConversation) => {
                    if (currentConversation.id === conversation.id) {
                        return {
                            ...currentConversation,
                            messages: conversation.messages || currentConversation.messages,
                            lastMessageAt: conversation.lastMessageAt || currentConversation.lastMessageAt,
                            users: currentConversation.users,
                        };
                    }
                    return currentConversation;
                })
            );
        };

        pusherClient.bind("conversation:new", newHandler);
        pusherClient.bind("conversation:update", updateHandler);
        return () => {
            pusherClient.unsubscribe(pusherKey);
            pusherClient.unbind("conversation:new", newHandler);
            pusherClient.unbind("conversation:update", updateHandler);
        };
    }, [pusherKey]);

    return (
        <aside
            className={clsx(
                `fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200`,
                isOpen ? "hidden" : "block w-full left-0"
            )}
        >
            <div className="px-5">
                <div className="flex justify-between mb-4 pt-4">
                    <div className="text-2xl font-bold text-neutral-800">Messages</div>
                    <div>
                        <MdOutlineGroupAdd size={20} />
                    </div>
                </div>
                {items.length === 0 ? (
                    <p className="text-gray-500">No conversations found</p>
                ) : (
                    items.map((item) => (
                        <ConversationBox
                            key={item.id}
                            data={item}
                            selected={conversationId === item.id}
                        />
                    ))
                )}
            </div>
        </aside>
    );
}

export default ConversationList;