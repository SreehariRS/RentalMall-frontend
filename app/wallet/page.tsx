import getCurrentUser from "@/app/actions/getCurrentUser";
import { getWalletBalance } from "@/app/actions/getWallet";
import WalletClient from "./WalletClient";

export default async function WalletPage() {
  const currentUser = await getCurrentUser();

  // Fetch wallet balance on the server side if user is logged in
  let walletBalance: number | null = null;
  if (currentUser) {
    try {
      walletBalance = await getWalletBalance(currentUser.id);
    } catch (error) {
      console.error("Error fetching wallet balance on server:", error);
      walletBalance = null;
    }
  }

  return <WalletClient currentUser={currentUser} initialWalletBalance={walletBalance} />;
}