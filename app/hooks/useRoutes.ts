import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HiChat, HiArrowLeft } from "react-icons/hi"; // Changed import
import { HiUser } from "react-icons/hi2";
import useConversation from "./useConversation";

const useRoutes = () => {
    const pathname = usePathname();
    const { conversationId } = useConversation();
    const router = useRouter();

    const routes = useMemo(() => [
        {
            label: "Chat",
            href: "/conversations",
            icon: HiChat,
            active: pathname === "/conversation" || !!conversationId
        },
        {
            label: "Users",
            href: "/user/chat",
            icon: HiUser,
            active: pathname === "/users" || !!conversationId
        },
        {
            label: "Back",
            href: "/",
            onClick: () => router.push('/'),
            icon: HiArrowLeft, // Changed to back arrow icon
        },
    ], [pathname, conversationId, router]);

    return routes;
}

export default useRoutes;