import { useMemo } from "react";
import {  usePathname } from "next/navigation";
import {HiChat} from "react-icons/hi"
import {HiArrowLeftOnRectangle,HiUser} from "react-icons/hi2"
import {signOut} from "next-auth/react"
import useConversation from "./useConversation";

const useRoutes =()=>{
    const pathname = usePathname()
    const {conversationId} = useConversation()

const routes = useMemo(()=>[
    {
        label :"Chat",
        href:"/conversations",
        icon:HiChat,
        active: pathname === "/conversation" || !! conversationId
    },

    {
        label :"Users",
        href:"/user/chat",
        icon:HiUser,
        active: pathname === "/users" || !! conversationId
    },
    {
        label :"Logout",
        href:"#",
        onclick:()=>signOut(),
        icon:HiArrowLeftOnRectangle,
    },
],[pathname , conversationId])
return routes
}

export default useRoutes