"use client";
import { AiOutlineMenu } from "react-icons/ai";
import React, { useCallback, useState, useEffect } from "react";
import Avatar from "../Avatar";
import MenuItem from "./MenuItem";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import { signOut } from "next-auth/react";
import { SafeUser } from "@/app/types";
import useRentModal from "@/app/hooks/useRentModal";
import { useRouter } from "next/navigation";
import useNotificationStore from "@/app/hooks/useNotifications";
import { pusherClient } from "@/app/libs/pusher";
import axios from "axios";
import toast from "react-hot-toast";

interface UserMenuProps {
  currentUser?: SafeUser | null;
}

function UserMenu({ currentUser }: UserMenuProps) {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const rentModal = useRentModal();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isHostView, setIsHostView] = useState(false);
  const { count: notificationsCount, fetchCount, incrementCount, decrementCount } = useNotificationStore();
  const [hasUnseenMessages, setHasUnseenMessages] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);

  // Fetch notifications count when the user is logged in
  useEffect(() => {
    if (currentUser) {
      fetchCount();
      const interval = setInterval(fetchCount, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser, fetchCount]);

  // Fetch `isRestricted` status from the backend
  useEffect(() => {
    const fetchRestrictionStatus = async () => {
      try {
        if (currentUser?.id) {
          const response = await axios.get(`/api/users/${currentUser.id}/restriction-status`);
          setIsRestricted(response.data.isRestricted); // Ensure this endpoint returns { isRestricted: boolean }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to fetch restriction status", error.message);
        } else {
          console.error("Failed to fetch restriction status", error);
        }
      }
    };

    if (currentUser) {
      fetchRestrictionStatus();
    }
  }, [currentUser]);

  // Check for unseen messages
  useEffect(() => {
    const fetchUnseenMessages = async () => {
      try {
        if (!currentUser?.email) return;

        const response = await fetch("/api/conversations/unseen-count");
        const data = await response.json();
        setHasUnseenMessages(data.count > 0);
      } catch (error) {
        console.error("Failed to fetch unseen messages", error);
      }
    };

    if (currentUser) {
      fetchUnseenMessages();
      const interval = setInterval(fetchUnseenMessages, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Subscribe to Pusher for real-time updates
  useEffect(() => {
    if (!currentUser?.email) return;

    const notificationChannel = `user-${currentUser.email}-notifications`;
    pusherClient.subscribe(notificationChannel);

    const conversationChannel = currentUser.email;
    pusherClient.subscribe(conversationChannel);

    const newNotificationHandler = () => incrementCount();
    const removedNotificationHandler = () => decrementCount();
    const conversationUpdateHandler = () => setHasUnseenMessages(true);
    const messageSeenHandler = () => {
      fetch("/api/conversations/unseen-count")
        .then((res) => res.json())
        .then((data) => setHasUnseenMessages(data.count > 0));
    };

    pusherClient.bind("notification:new", newNotificationHandler);
    pusherClient.bind("notification:remove", removedNotificationHandler);
    pusherClient.bind("conversation:update", conversationUpdateHandler);
    pusherClient.bind("message:update", messageSeenHandler);

    return () => {
      pusherClient.unsubscribe(notificationChannel);
      pusherClient.unsubscribe(conversationChannel);
      pusherClient.unbind("notification:new", newNotificationHandler);
      pusherClient.unbind("notification:remove", removedNotificationHandler);
      pusherClient.unbind("conversation:update", conversationUpdateHandler);
      pusherClient.unbind("message:update", messageSeenHandler);
    };
  }, [currentUser, incrementCount, decrementCount]);

  // Prevent restricted hosts from listing properties
  const onRent = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    if (isRestricted) {
      return toast.error("You are no longer allowed to list properties. Please contact support for more details.");
    }

    rentModal.onOpen();
  }, [currentUser, loginModal, rentModal, isRestricted]);

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  const toggleHostView = useCallback(() => {
    setIsHostView((prev) => !prev);
    router.push("/");
  }, [router]);

  const goToProfile = useCallback(() => {
    router.push("/user/profile");
  }, [router]);

  const goToFavorites = useCallback(() => {
    router.push("/user/favorite");
  }, [router]);

  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-3">
        <div
          onClick={onRent}
          className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
        >
          List Your Rental
        </div>
        <div
          onClick={toggleOpen}
          className="p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition"
        >
          <div className="relative">
            <AiOutlineMenu />
          </div>
          {/* Display red dot for unseen messages */}
          {hasUnseenMessages && (
            <span className="absolute top-0 -right-2 flex">
              <span className="relative flex h-4 w-4">
                <span className="animate-bounce absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
              </span>
            </span>
          )}
          {notificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex">
              <span className="relative flex h-5 w-5">
                <span className="animate-bounce absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white justify-center items-center">
                  <span className="text-[10px] font-medium leading-none text-white">
                    {notificationsCount}
                  </span>
                </span>
              </span>
            </span>
          )}
          <div className="hidden md:block">
            <Avatar src={currentUser?.image} />
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute rounded-xl shadow-md w-[40vw] md:w-3/4 bg-white overflow-hidden right-0 top-12 text-sm">
          <div className="flex flex-col cursor-pointer">
            {currentUser ? (
              isHostView ? (
                <>
                  <MenuItem onClick={() => router.push("/properties")} label="My Properties" />
                  <MenuItem
                    onClick={() => router.push("/conversations")}
                    label="Messages"
                    isBadgeVisible={hasUnseenMessages}
                  />
                  <MenuItem onClick={() => router.push("/reservations")} label="My Reservations" />
                  <MenuItem onClick={onRent} label="List your Rental" />
                  <MenuItem onClick={toggleHostView} label="Switch to User" />
                </>
              ) : (
                <>
                  <MenuItem onClick={goToProfile} label="Profile" />
                  <MenuItem
                    onClick={() => router.push("/notifications")}
                    label="Notifications"
                    isBadgeVisible={notificationsCount > 0}
                  />
                  <MenuItem
                    onClick={() => router.push("/conversations")}
                    label="Messages"
                    isBadgeVisible={hasUnseenMessages}
                  />
                  <MenuItem onClick={goToFavorites} label="My Favorites" />
                  <MenuItem onClick={() => router.push("/trips")} label="Bookings" />
                  <MenuItem onClick={toggleHostView} label="Switch to Host" />
                  <MenuItem onClick={handleLogout} label="Logout" />
                </>
              )
            ) : (
              <>
                <MenuItem onClick={loginModal.onOpen} label="Login" />
                <MenuItem onClick={registerModal.onOpen} label="Sign up" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;