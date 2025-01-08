import EmptyState from "@/app/components/EmptyState";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getFavoriteListings from "@/app/actions/getFavoritesListings";
import FavoritesClient from "./FavoritesClient";


const Listingpage = async()=>{
    const listings = await getFavoriteListings()
    const currentUser = await getCurrentUser()

if(listings.length ===0){
    return(
    <EmptyState
    title="No favorites fount"
    subtitle="Looks like you have no favorites listings"
    
    />
   )
}
return (
    <FavoritesClient
    listings={listings}
    currentUser={currentUser}
    />
)
   
}


export default Listingpage