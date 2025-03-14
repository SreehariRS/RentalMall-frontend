import getCurrentUser from "./actions/getCurrentUser";
import getListings, { IlistingsParams } from "./actions/getListings";
import Container from "./components/Container";
import EmptyState from "./components/EmptyState";
import ListingCards from "./components/listings/ListingCards";
import ClientInfiniteScrollWrapper from "./components/ClientInfiniteScrollWrapper";

export const dynamic = "force-dynamic"; // Ensure dynamic rendering

interface HomeProps {
  searchParams: { [key: string]: string | string[] | undefined }; // Match Next.js searchParams type
}

const Home = async ({ searchParams }: HomeProps) => {
  const initialParams: IlistingsParams = {
    ...searchParams,
    // Add any necessary type casting or defaults if needed
  } as IlistingsParams;
  const initialPage = 1;
  const initialLimit = 12;

  // Fetch initial listings on the server
  const initialData = await getListings({
    ...initialParams,
    page: initialPage,
    limit: initialLimit,
  });

  const currentUser = await getCurrentUser();

  if (!initialData.listings || initialData.listings.length === 0) {
    return <EmptyState showReset />;
  }

  return (
    <div>
      <Container>
        <ClientInfiniteScrollWrapper
          initialListings={initialData.listings}
          initialPage={initialPage}
          totalPages={initialData.totalPages}
          searchParams={initialParams}
          currentUser={currentUser}
          limit={initialLimit}
        />
      </Container>
    </div>
  );
};

export default Home;