"use client";

import useOtherUser from "@/app/hooks/useOtherUser";
import type { Conversation, User } from "@prisma/client";
import { format } from "date-fns";
import { Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Avatar from "@/app/components/Avatar";
import { IoClose, IoTrash } from "react-icons/io5";
import ConversationId from "../page";
import useActiveList from "@/app/hooks/useActiveList";

interface ProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    data: Conversation & {
        users: User[];
    };
}

export default function ProfileDrawer({ isOpen, onClose, data }: ProfileDrawerProps) {
    const otherUser = useOtherUser(data);
    const {members} = useActiveList()
    const isActive = members.indexOf(otherUser?.email!)!==-1
    const joinedDate = useMemo(() => {
        return format(new Date(otherUser.createdAt), "PP");
    }, [otherUser.createdAt]);

    const title = useMemo(() => {
        return data.name || otherUser.name;
    }, [data.name, otherUser.name]);

    const statusText = useMemo(() => {
        if (data.isGroup) {
            return `${data.users.length} members`;
        }
        return isActive?"Active":"Offline"
    }, [data,isActive]);

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl">
                                        <div className="px-4 sm:px-6">
                                            <div className="flex items-start justify-end">
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        onClick={onClose}
                                                        className="rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                                                    >
                                                        <span className="sr-only">Close panel</span>
                                                        <IoClose size={24} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative mt-6 flex-1 px-4 sm:px-6">
                                            <div className="flex flex-col items-center">
                                                <div className="relative mb-2">
                                                    <Avatar src={otherUser?.image} className="h-24 w-24" />
                                                    <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                                                </div>

                                                <div className="mt-3 text-center">
                                                    <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
                                                    <p className="mt-1 text-sm text-gray-500">{statusText}</p>
                                                </div>

                                                <div className="mt-8">
                                                    <button
                                                        onClick={() => {}}
                                                        className="flex items-center gap-2 rounded-md bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-200 transition"
                                                    >
                                                        <IoTrash size={20} />
                                                        Delete Conversation
                                                    </button>
                                                </div>

                                                <div className="mt-8 w-full border-t border-gray-200" />

                                                {!data.isGroup && (
                                                    <div className="w-full space-y-6 pt-6">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-500">
                                                                Email
                                                            </div>
                                                            <div className="mt-1 text-sm text-gray-900">
                                                                {otherUser.email}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="text-sm font-medium text-gray-500">
                                                                Joined
                                                            </div>
                                                            <div className="mt-1 text-sm text-gray-900">
                                                                <time dateTime={joinedDate}>{joinedDate}</time>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
