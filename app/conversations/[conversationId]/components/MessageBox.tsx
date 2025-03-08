"use client";

import { FullMessageType } from "@/app/types";
import { useSession } from "next-auth/react";
import Avatar from "@/app/components/Avatar";
import { format } from "date-fns";
import Image from "next/image";
import { useState } from "react";

interface MessageBoxProps {
  data: FullMessageType;
  isLast?: boolean;
}

function MessageBox({ data, isLast }: MessageBoxProps) {
  const session = useSession();
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  
  const isOwn = session?.data?.user?.email === data?.sender?.email;
  const seenUser = (data.seen || [])
    .find((user) => user.email !== data.sender.email);

  const toggleImageSize = () => {
    setIsImageEnlarged(!isImageEnlarged);
  };

  return (
    <div className={`flex gap-3 p-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex-shrink-0 mt-1">
        <Avatar src={data.sender?.image} />
      </div>
      
      <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-sm font-medium text-gray-700">{data.sender.name}</span>
          <span className="text-xs text-gray-400">
            {format(new Date(data.createdAt), "p")}
          </span>
        </div>
        
        <div className={`mt-1 px-4 py-2 rounded-2xl shadow-sm
          ${isOwn 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none' 
            : 'bg-white border border-gray-200 rounded-tl-none'
          }`}>
          {data.image ? (
            <div className="relative">
              <Image
                alt="Shared image"
                height={isImageEnlarged ? 480 : 240}
                width={isImageEnlarged ? 480 : 240}
                src={data.image}
                className="rounded object-cover cursor-pointer transition-all duration-300"
                onClick={toggleImageSize}
              />
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                Click to {isImageEnlarged ? 'shrink' : 'enlarge'}
              </div>
            </div>
          ) : data.voice ? (
            <audio controls className="max-w-full">
              <source src={data.voice} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <div className={`text-sm ${isOwn ? 'text-white' : 'text-gray-800'}`}>
              {data.body}
            </div>
          )}
        </div>
        
        {isLast && isOwn && seenUser && (
          <div className="flex items-center gap-1 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500">
              Seen by {seenUser.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBox;