import getCurrentUser from "@/app/actions/getCurrentUser";
import { getWalletBalance, getWalletTransactions } from "@/app/actions/getWallet";
import WalletClient from "./WalletClient";

// Add this line to make the page dynamic
export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const currentUser = await getCurrentUser();

  // Fetch wallet balance and transactions on the server side if user is logged in
  let walletBalance: number | null = null;
  let walletTransactions: any[] = [];
  if (currentUser) {
    try {
      walletBalance = await getWalletBalance(currentUser.id);
      walletTransactions = await getWalletTransactions(currentUser.id);
    } catch (error) {
      console.error("Error fetching wallet data on server:", error);
      walletBalance = null;
      walletTransactions = [];
    }
  }

  return (
    <WalletClient
      currentUser={currentUser}
      initialWalletBalance={walletBalance}
      initialWalletTransactions={walletTransactions}
    />
  );
}