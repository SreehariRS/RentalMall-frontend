"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "../components/Container";
import Heading from "../components/Heading";
import { SafeUser } from "../types";
import toast from "react-hot-toast";

interface WalletClientProps {
  currentUser?: SafeUser | null;
  initialWalletBalance: number | null; // Add prop for initial balance
}

function WalletClient({ currentUser, initialWalletBalance }: WalletClientProps) {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState<number | null>(initialWalletBalance);

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please log in to view your wallet.");
      router.push("/login");
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null; // Render nothing while redirecting
  }

  return (
    <Container>
      <Heading title="Your Wallet" subtitle="Manage your balance and transactions" />
      <div className="mt-10">
        {walletBalance !== null ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Wallet Balance</h2>
            <p className="text-lg">Current Balance: ₹{walletBalance.toFixed(2)}</p>
            {/* Add more wallet features here, like transaction history or withdrawal options */}
          </div>
        ) : (
          <p>Error loading wallet balance. Please try again later.</p>
        )}
      </div>
    </Container>
  );
}

export default WalletClient;