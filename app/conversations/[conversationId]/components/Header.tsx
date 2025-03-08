"use client";

import Avatar from "@/app/components/Avatar";
import useOtherUser from "@/app/hooks/useOtherUser";
import { Conversation, User } from "@prisma/client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { HiChevronLeft, HiEllipsisHorizontal } from "react-icons/hi2";
import ProfileDrawer from "./ProfileDrawer";
import useActiveList from "@/app/hooks/useActiveList";

interface HeaderProps {
  conversation: Conversation & {
    users: User[];
  };
}

function Header({ conversation }: HeaderProps) {
  const otherUser = useOtherUser(conversation);
  const [drawerOpen , setDrawerOpne ]= useState(false )
  const {members} = useActiveList()
  const isActive  = members.indexOf(otherUser?.email!) !==-1
  
  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      return `${conversation.users.length} members`;
    }
    return isActive? "Active": "Offline"
  }, [conversation ,isActive]);

  return (
    <>

    <ProfileDrawer
    data={conversation}
    isOpen={drawerOpen}
    onClose={()=>setDrawerOpne(false)}
    />
     <div className="bg-white w-full flex border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 justify-between items-center shadow-sm">
      <div className="flex gap-3 items-center">
        <Link
          href="/conversations"
          className="lg:hidden block text-rose-500 hover:text-rose-600 transition cursor-pointer"
        >
          <HiChevronLeft size={32} />
        </Link>
        <Avatar src={otherUser?.image} />
        <div className="flex flex-col">
    <div>
    {otherUser.name}
    </div>
    <div className="text-sm font-light text-neutral-500">
{statusText}
     </div>
        </div>
      </div>
      <HiEllipsisHorizontal
      size={32}
      onClick={()=>setDrawerOpne(true)}
      className=" text-rose-500 cursor-pointer hover:text-rose-600 transition "
      />

    </div>
    </>
   
  );
}

export default Header;
