import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import EmptyState from "@/app/components/EmptyState";
import ListingClient from "./ListingClient";
import getreservations from "@/app/actions/getReservation";

interface IParams {
  listingId: string;
}

const ListingPage = async ({ params }: { params: IParams }) => {
  const { listingId } = params; 
  const listing = await getListingById({ listingId }); 
  const reservations = await getreservations(params)
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
