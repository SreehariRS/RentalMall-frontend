import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import EmptyState from "@/app/components/EmptyState";
import ListingClient from "./ListingClient";
import getreservations from "@/app/actions/getReservation";

const ListingPage = async ({ params }: any) => {
  const { listingId } = params as { listingId: string };
  const listing = await getListingById({ listingId });
  const reservations = await getreservations({ listingId }); // Adjusted to pass listingId
  const currentUser = await getCurrentUser();

  if (!listing) {
    return <EmptyState />;
  }

  return (
    <div>
      <ListingClient
        listing={listing}
        reservations={reservations}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ListingPage;