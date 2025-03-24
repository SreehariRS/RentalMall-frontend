import { redirect } from "next/navigation";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getListings from "@/app/actions/getListings";
import ProfileDetailsClient from "./ProfileDetailsClient";
import { SafeUser } from "@/app/types";

export default async function ProfileDetailsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  const listingsData = await getListings({ userId: currentUser.id });
  const listings = listingsData.listings;

  const totalReviews = listingsData.listings.reduce(
    (acc, listing) => acc + (listing.rating !== null ? 1 : 0),
    0
  );

  const userData = {
    fullName: currentUser.name || "Anonymous",
    email: currentUser.email || "No email provided",
    profileImage: currentUser.image || "/images/profile.png",
    about: currentUser.about || "No about information provided.",
    joinDate: new Date(currentUser.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    totalListings: listings.length,
    reviews: totalReviews,
    listings: listings,
  };

  return <ProfileDetailsClient user={userData} currentUser={currentUser} />;
}