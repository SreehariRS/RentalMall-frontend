"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import ClientBlockCheck from "../ClientBlockCheck";
import Footer from "../footer"; 

interface NavbarWrapperProps {
  children: React.ReactNode;
  currentUser: any;
}

const NavbarWrapper = ({ children, currentUser }: NavbarWrapperProps) => {
  const pathname = usePathname() || ""; // ✅ Ensure pathname is always a string

  // Add conditions for routes where Navbar should not be displayed
  const isExcludedRoute = pathname.startsWith("/admin") || 
                          pathname === "/verify-email" ||  
                          pathname === "/user/chat" ||
                          pathname.startsWith("/conversations");

  // Hide footer on /user/chat, /conversations, and /admin
  const hideFooter = pathname.startsWith("/admin") || 
                     pathname === "/user/chat" || 
                     pathname.startsWith("/conversation");

  return (
    <>
      {!isExcludedRoute && <Navbar currentUser={currentUser} />}
      {currentUser && <ClientBlockCheck isBlocked={currentUser.isBlocked} />}
      <div className={`${!isExcludedRoute ? "pb-20 pt-28" : ""}`}>
        {children}
      </div>
      {!hideFooter && <Footer />} 
    </>
  );
};

export default NavbarWrapper;
