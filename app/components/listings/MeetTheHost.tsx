"use client";

import { useEffect, useState } from "react";
import { MessageCircle, CheckCircle, Calendar, Clock, MapPin, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Avatar from "../Avatar";
import Button from "../Button";
import { SafeUser } from "@/app/types"; // Assuming SafeUser is imported from types

interface MeetTheHostProps {
    hostName: string;
    hostImage?: string | null;
    hostingSince: string;
    experienceInMonths: number;
    onMessageHost: () => void;
    currentUser?: SafeUser | null; // Added currentUser prop
}

const MeetTheHost = ({ hostName, hostImage, hostingSince, experienceInMonths, onMessageHost, currentUser }: MeetTheHostProps) => {
    const [mounted, setMounted] = useState(false);
    const router = useRouter(); 

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const handleMessageHost = () => {
        router.push("/user/chat");
    };

    // Disable button if current user is the host (comparing names as a fallback)
    const isOwnHost = currentUser?.name === hostName;

    return (
        <div className="bg-gradient-to-br from-white to-neutral-50 rounded-2xl border border-neutral-200 shadow-sm">
            <div className="p-8">
                {/* Header with Gradient Border */}
                <div className="border-b border-neutral-200 pb-6 mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent">
                        Meet Your Host
                    </h2>
                </div>

                {/* Main Content */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Left Column - Host Profile */}
                    <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                            <div className="relative">
                                <Avatar src={hostImage} size={100} />
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                                    <CheckCircle className="text-green-500 w-6 h-6" />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-800">{hostName}</h3>
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">Superhost</span>
                        </div>
                    </div>

                    {/* Right Column - Host Info */}
                    <div className="flex-1 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-neutral-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Calendar className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-600">Hosting since</p>
                                        <p className="font-medium text-neutral-800">{hostingSince}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-neutral-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <Clock className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-600">Experience</p>
                                        <p className="font-medium text-neutral-800">{experienceInMonths} months</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Host Bio */}
                        <div className="bg-white p-5 rounded-xl border border-neutral-100">
                            <p className="text-neutral-600 text-sm leading-relaxed">
                                Professional host with a passion for creating memorable stays. Quick to respond and
                                always ready to help make your experience exceptional.
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2">
                            <Button
                                label="Message Host"
                                onClick={handleMessageHost} 
                                black={true}
                                disabled={isOwnHost} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetTheHost;