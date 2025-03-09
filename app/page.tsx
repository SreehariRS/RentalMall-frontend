import getCurrentUser from "./actions/getCurrentUser";
import getListings, { IlistingsParams } from "./actions/getListings";
import Container from "./components/Container";
import EmptyState from "./components/EmptyState";
import ListingCards from "./components/listings/ListingCards";

const Home = async ({ searchParams }: any) => {
  const params = searchParams as IlistingsParams; // Cast to IlistingsParams

  const listings = await getListings(params);
  const currentUser = await getCurrentUser();

  if (listings.length === 0) {
    return <EmptyState showReset />;
  }

  return (
    <div>
      <Container>
        <div className="pt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-col-5 2xl:grid-cols-6 gap-8">
          {listings.map((listing) => {
            return (
              <ListingCards
                currentUser={currentUser}
                key={listing.id}
                data={listing}
              />
            );
          })}
        </div>
      </Container>
    </div>
  );
};

export default Home;