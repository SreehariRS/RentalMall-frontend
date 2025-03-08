"use client";

import useConversation from "@/app/hooks/useConversation";
import { FullMessageType } from "@/app/types";
import { useEffect, useRef, useState } from "react";
import MessageBox from "./MessageBox";
import axios from "axios";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";

interface BodyProps {
  initialMessages: FullMessageType[];
}

function Body({ initialMessages }: BodyProps) {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useConversation();

  useEffect(() => {
    if (!conversationId) return;
    axios.post(`/api/conversations/${conversationId}/seen`).catch((error) => {
      console.error("Failed to mark conversation as seen:", error);
    });
  }, [conversationId]);

  useEffect(() => {
    console.log("Initial messages:", initialMessages);
    if (!conversationId) return;

    pusherClient.subscribe(conversationId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: FullMessageType) => {
      console.log("New message from Pusher:", message);
      axios.post(`/api/conversations/${conversationId}/seen`).catch((error) => {
        console.error("Failed to mark message as seen:", error);
      });

      setMessages((current) => {
        if (find(current, { id: message.id })) return current;
        return [...current, message];
      });
      bottomRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      console.log("Updated message from Pusher:", newMessage);
      setMessages((current) =>
        current.map((currentMessage) =>
          currentMessage.id === newMessage.id ? newMessage : currentMessage
        )
      );
    };

    pusherClient.bind("messages:new", messageHandler);
    pusherClient.bind("message:update", updateMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind("messages:new", messageHandler);
      pusherClient.unbind("message:update", updateMessageHandler);
    };
  }, [conversationId]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox
          isLast={i === messages.length - 1}
          key={message.id}
          data={message}
        />
      ))}
      <div ref={bottomRef} className="pt-24" />
    </div>
  );
}

export default Body;