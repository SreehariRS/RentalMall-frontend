import EmptyState from "../components/EmptyState";
import getCurrentUser from "../actions/getCurrentUser";
import getReservations from "../actions/getReservation"; // Import as default
import { getCancelledReservations } from "../actions/getReservation"; // Named import
import { getWalletBalance } from "../actions/getWallet";
import TripsClient from "./TripsClient";

const TripsPage = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return (
      <EmptyState
        title="Unauthorized"
        subtitle="Please login"
      />
    );
  }

  const [reservations, cancelledReservations] = await Promise.all([
    getReservations({ userId: currentUser.id }), // Use the default import
    getCancelledReservations({ userId: currentUser.id }),
  ]);

  if (reservations.length === 0 && cancelledReservations.length === 0) {
    return (
      <EmptyState
        title="No rentals found"
        subtitle="Looks like you haven't reserved any rental items yet"
      />
    );
  }

  let walletBalance: number | null = null;
  try {
    walletBalance = await getWalletBalance(currentUser.id);
  } catch (error) {
    console.error("Error fetching wallet balance on server:", error);
    walletBalance = null;
  }

  return (
    <TripsClient
      reservation={reservations}
      cancelledReservations={cancelledReservations}
      currentUser={currentUser}
      initialWalletBalance={walletBalance}
    />
  );
};

export default TripsPage;