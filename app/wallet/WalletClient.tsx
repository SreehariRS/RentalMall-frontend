"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "../components/Container";
import Heading from "../components/Heading";
import { SafeUser } from "../types";
import toast from "react-hot-toast";

interface WalletTransaction {
  id: string;
  amount: number;
  type: string;
  description?: string;
  createdAt: string;
}

interface WalletClientProps {
  currentUser?: SafeUser | null;
  initialWalletBalance: number | null;
  initialWalletTransactions: WalletTransaction[];
}

function WalletClient({
  currentUser,
  initialWalletBalance,
  initialWalletTransactions,
}: WalletClientProps) {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState<number | null>(initialWalletBalance);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(
    initialWalletTransactions
  );

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
            <p className="text-lg mb-6">Current Balance: ₹{walletBalance.toFixed(2)}</p>
            <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
            {walletTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left">Date</th>
                      <th className="py-2 px-4 border-b text-left">Description</th>
                      <th className="py-2 px-4 border-b text-left">Type</th>
                      <th className="py-2 px-4 border-b text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {transaction.description || "No description"}
                        </td>
                        <td className="py-2 px-4 border-b">{transaction.type}</td>
                        <td
                          className={`py-2 px-4 border-b ${
                            transaction.type === "CREDIT"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "CREDIT" ? "+" : "-"}₹
                          {Math.abs(transaction.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No transactions found.</p>
            )}
          </div>
        ) : (
          <p>Error loading wallet balance. Please try again later.</p>
        )}
      </div>
    </Container>
  );
}

export default WalletClient;