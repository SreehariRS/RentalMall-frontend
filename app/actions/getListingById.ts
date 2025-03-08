import prisma from "../libs/prismadb";

interface IParams {
  listingId?: string;
}

export default async function getListingById(params: IParams) {
  try {
    const { listingId } = params;

    if (!listingId) {
      return null;
    }

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      include: {
        user: true,
      },
    });

    if (!listing) {
      return null;
    }

    return {
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      user: listing.user
        ? {
            ...listing.user,
            createdAt: listing.user.createdAt.toISOString(),
            updatedAt: listing.user.updatedAt.toISOString(),
            emailVerified: listing.user.emailVerified?.toISOString() || null,
          }
        : null,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch listing: ${error.message}`);
    }
    throw new Error("Failed to fetch listing");
  }
}