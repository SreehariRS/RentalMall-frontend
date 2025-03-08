import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import RegisterModal from "./components/modals/RegisterModal";
import TosterProviders from "./providers/ToasterProvider";
import LoginModal from "./components/modals/LoginModal";
import getCurrentUser from "./actions/getCurrentUser";
import RentModal from "./components/modals/RentModal";
import NavbarWrapper from "./components/Navbar/navbarWrapper";
import SearchModal from "./components/modals/SearchModal";
import AuthProvider from "./providers/AuthProvider";
import ActiveStatus from "./components/ActiveStatus";

const geistSans = Nunito({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Nunito({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RentalMall",
  description: "Select your Rental",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <TosterProviders />
          <RentModal />
          <SearchModal/>
          <LoginModal />
          <RegisterModal />
          <NavbarWrapper currentUser={currentUser}>
            <ActiveStatus/>
            {children}
          </NavbarWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}