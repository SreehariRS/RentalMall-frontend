import Container from "@/app/components/Container";
import Heading from "@/app/components/Heading";
import ListingCards from "@/app/components/listings/ListingCards";
import { safelisting, SafeUser } from "@/app/types";

interface FavoritesClientProps {
    listings: safelisting[];
    currentUser?: SafeUser | null;
}

function FavoritesClient({ listings, currentUser }: FavoritesClientProps) {
    return (
        <Container>
            <Heading
            title="Favorites"
            subtitle="List of rental you have favorited! "
            />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
{listings.map((listing)=>(
    <ListingCards
    currentUser={currentUser}
    key={listing.id}
    data={listing}
    />
))}
            </div>
        </Container>
    );
}

export default FavoritesClient;
