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
  page?: number; // Add page for pagination
  limit?: number; // Add limit for pagination
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
      page = 1, // Default to page 1
      limit = 12, // Default to 10 items per page
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

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch paginated listings
    const listings = await prisma.listing.findMany({
      where: query,
      orderBy: { createdAt: "desc" },
      skip: skip,
      take: limit,
    });

    // Fetch total count for pagination metadata
    const totalCount = await prisma.listing.count({ where: query });

    const safeListings = listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      imageSrc: listing.imageSrc ?? [],
    }));

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