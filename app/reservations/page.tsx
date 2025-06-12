import EmptyState from "../components/EmptyState";
import getCurrentUser from "../actions/getCurrentUser";
import getReservations, { getRevenue } from "../actions/getReservation";
import ReservationsClient from "./ReservationsClient";

const ReservationPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <EmptyState title="Unauthorized" subtitle="Please login" />
    );
  }

  const reservations = await getReservations({
    authorId: currentUser.id,
  });

  const revenueData = await getRevenue(currentUser.id);

  if (reservations.length === 0) {
    return (
      <EmptyState
        title="No Reservations Found"
        subtitle="Looks like you have no reservations on your properties"
      />
    );
  }

  return (
    <ReservationsClient
      reservations={reservations}
      currentUser={currentUser}
      revenueData={revenueData}
    />
  );
};

export default ReservationPage;