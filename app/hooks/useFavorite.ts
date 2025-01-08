'use client';

import axios from "axios";
import { useRouter } from "next/navigation";                        
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { SafeUser } from "../types";
import useLoginModal from "./useLoginModal";

interface IUseFavorite {
    listingId: string;
    currentUser?: SafeUser | null;
}

const useFavorite = ({ listingId, currentUser }: IUseFavorite) => {
    const router = useRouter();
    const loginModal = useLoginModal();

    const hasFavorited = useMemo(() => {
        const list = currentUser?.favoriteIds || [];
        return list.includes(listingId);
    }, [currentUser, listingId]);

    const toggleFavorite = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    
        if (!currentUser) {
            console.log("User not logged in, opening login modal.");
            return loginModal.onOpen();
        }
    
        try {
            let request;
            if (hasFavorited) {
                console.log("Sending DELETE request for listingId:", listingId);
                request = () => axios.delete(`/api/favorites/${listingId}`);
            } else {
                console.log("Sending POST request for listingId:", listingId);
                request = () => axios.post(`/api/favorites/${listingId}`);
            }
    
            await request();
            console.log("Request successful.");
            router.refresh();
            toast.success("Success");
        } catch (error: any) {
            console.error("API error:", error?.response?.data || error.message);
            toast.error(error?.response?.data?.message || "Something went wrong.");
        }
    }, [currentUser, hasFavorited, listingId, loginModal, router]);
    

    return {
        hasFavorited,
        toggleFavorite,
    };
};

export default useFavorite;
