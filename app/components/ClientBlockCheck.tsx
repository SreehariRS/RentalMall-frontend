"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

interface BlockCheckProps {
  isBlocked: boolean;
}

export default function ClientBlockCheck({ isBlocked }: BlockCheckProps) {
  useEffect(() => {
    if (isBlocked) {
      toast.error("You have been blocked by the admin.");
      signOut();
    }
  }, [isBlocked]);

  return null; 
}
