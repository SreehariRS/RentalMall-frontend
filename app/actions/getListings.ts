import prisma from "@/app/libs/prismadb";

export interface IlistingsParams {
    userId?: string;
    guestCount?: number;
    roomCount?: number;
    startDate?: string;
    endDate?: string;
    locationValue?: string;
    category?: string;
}

export default async function getListings(params: IlistingsParams) {
    try {
        const { userId, roomCount, guestCount, locationValue, startDate, endDate, category } = params;
            const query: any = {};

        if (userId) {
            query.userId = userId;
        }
        if (category) {
            query.category = category;
        }

        if (roomCount) {
            query.roomCount = {
                gte: +roomCount,
            };
        }
        if (guestCount) {
            query.guestCount = {
                gte: +guestCount,
            };
        }

        if (locationValue) {
            query.locationValues = locationValue;
        }

        if (startDate && endDate) {
            query.reservations = {
                none: {
                    OR: [
                        {
                            endDate: { gte: startDate },
                            startDate: { lte: startDate },
                        },
                        {
                            startDate: { lte: endDate },
                            endDate: { gte: endDate }, // Fixed condition
                        },
                    ],
                },
            };
        }

        const listings = await prisma.listing.findMany({
            where: query,
            orderBy: {
                createdAt: "desc",
            },
        });

        const safeListings = listings.map((listing) => ({
            ...listing,
            createdAt: listing.createdAt.toISOString(),
            imageSrc: listing.imageSrc ?? [],
        }));

        return safeListings;
    } catch (error: any) {
        console.error("Error fetching listings:", error);
        throw new Error(error.message || "Failed to fetch listings");
    }
}
