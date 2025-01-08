"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import ClientBlockCheck from "../ClientBlockCheck";

interface NavbarWrapperProps {
  children: React.ReactNode;
  currentUser: any;
}

const NavbarWrapper = ({ children, currentUser }: NavbarWrapperProps) => {
  const pathname = usePathname();

  // Add conditions for routes where Navbar should not be displayed
  const isExcludedRoute = pathname?.startsWith("/admin") || pathname === "/verify-email";

  return (
    <>
      {!isExcludedRoute && <Navbar currentUser={currentUser} />}
      {currentUser && <ClientBlockCheck isBlocked={currentUser.isBlocked} />}
      <div className={`${!isExcludedRoute ? "pb-20 pt-28" : ""}`}>
        {children}
      </div>
    </>
  );
};

export default NavbarWrapper;
