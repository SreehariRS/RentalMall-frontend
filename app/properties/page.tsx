import EmptyState from "../components/EmptyState";
import getCurrentUser from "../actions/getCurrentUser";
import PropertiesClient from "./PropertiesClient";
import getListings from "../actions/getListings";

const PropertiesPage = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return (
      <EmptyState
        title="Unauthorized"
        subtitle="Please login"
      />
    );
  }

  // Fetch listings for the current user
  const listingsData = await getListings({
    userId: currentUser.id,
  });

  // Extract the listings array from the response
  const listings = listingsData.listings || [];

  if (listings.length === 0) {
    return (
      <EmptyState
        title="No properties found"
        subtitle="Looks like you have no rental properties"
      />
    );
  }

  return (
    <PropertiesClient
      listings={listings}
      currentUser={currentUser}
    />
  );
};

export default PropertiesPage;