import prisma from "@/app/libs/prismadb";

interface QueryType {
  userId?: string;
  category?: string;
  roomCount?: { gte: number };
  guestCount?: { gte: number };
  locationValues?: string;
  reservations?: {
    none: {
      OR?: Array<{
        startDate?: { lte: string };
        endDate?: { gte: string };
      }>;
    };
  };
}

export interface IlistingsParams {
  userId?: string;
  guestCount?: number;
  roomCount?: number;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export default async function getListings(params: IlistingsParams) {
  try {
    const {
      userId,
      roomCount,
      guestCount,
      locationValue,
      startDate,
      endDate,
      category,
      page = 1,
      limit = 12,
    } = params;

    const query: QueryType = {};

    if (userId) {
      query.userId = userId;
    }
    if (category) {
      query.category = category;
    }
    if (roomCount) {
      query.roomCount = { gte: +roomCount };
    }
    if (guestCount) {
      query.guestCount = { gte: +guestCount };
    }
    if (locationValue) {
      query.locationValues = locationValue;
    }
    if (startDate && endDate) {
      query.reservations = {
        none: {
          OR: [
            { endDate: { gte: startDate }, startDate: { lte: startDate } },
            { startDate: { lte: endDate }, endDate: { gte: endDate } },
          ],
        },
      };
    }

    const skip = (page - 1) * limit;

    // Fetch listings with their reviews
    const listings = await prisma.listing.findMany({
      where: query,
      orderBy: { createdAt: "desc" },
      skip: skip,
      take: limit,
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    const totalCount = await prisma.listing.count({ where: query });

    // Transform listings to include average rating
    const safeListings = listings.map((listing) => {
      const ratings = listing.reviews.map((review) => review.rating);
      const averageRating =
        ratings.length > 0 ? ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length : null;

      return {
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        imageSrc: listing.imageSrc ?? [],
        rating: averageRating, // Add average rating
        reviews: undefined, // Remove raw reviews from the response to keep it lightweight
      };
    });

    return {
      listings: safeListings,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error: unknown) {
    console.error("Error fetching listings:", error);
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to fetch listings");
    }
    throw new Error("Failed to fetch listings");
  }
}