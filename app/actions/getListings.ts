import prisma from "@/app/libs/prismadb";

export default async function getListings() {
  try {
    const listings = await prisma.listing.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const safeListings = listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
    }));

    return safeListings;
  } catch (error: any) {
    console.error("Error fetching listings:", error);
    throw new Error(error.message || "Failed to fetch listings");
  }
}
