import prisma from '@/app/libs/prismadb';
import { safeReservations, SafeCancelledReservations } from '@/app/types';

interface IParams {
  listingId?: string;
  userId?: string;
  authorId?: string;
}

export default async function getReservations(params: IParams): Promise<safeReservations[]> {
  try {
    const { listingId, userId, authorId } = params;

    const query: { listingId?: string; userId?: string; listing?: { userId: string } } = {};

    if (listingId) {
      query.listingId = listingId;
    }
    if (userId) {
      query.userId = userId;
    }
    if (authorId) {
      query.listing = { userId: authorId };
    }

    const reservations = await prisma.reservation.findMany({
      where: query,
      include: {
        listing: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const safeReservations = reservations
      .filter((reservation) => {
        // Skip reservations where listing is null (shouldn't happen due to schema constraints)
        if (!reservation.listing) {
          console.warn(`Reservation ${reservation.id} has no associated listing. Skipping.`);
          return false;
        }
        return true;
      })
      .map((reservation) => {
        const reservationCreatedTime = new Date(reservation.createdAt);
        const timeDiff = new Date().getTime() - reservationCreatedTime.getTime();
        const canCancel = timeDiff <= 24 * 60 * 60 * 1000;

        return {
          ...reservation,
          canCancel,
          orderId: reservation.orderId ?? 'No Order ID',
          createdAt: reservation.createdAt.toISOString(),
          startDate: reservation.startDate.toISOString(),
          endDate: reservation.endDate.toISOString(),
          listing: {
            ...reservation.listing!,
            createdAt: reservation.listing!.createdAt.toISOString(),
          },
          user: {
            name: reservation.user?.name || "Unknown User",
            email: reservation.user?.email || "No email provided",
          },
        } as safeReservations;
      });

    return safeReservations;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching reservations:", err.message);
    throw new Error(`Failed to fetch reservations: ${err.message}`);
  }
}

export async function getCancelledReservations(params: IParams): Promise<SafeCancelledReservations[]> {
  try {
    const { listingId, userId, authorId } = params;

    const query: { listingId?: string; userId?: string; listing?: { userId: string } } = {};

    if (listingId) {
      query.listingId = listingId;
    }
    if (userId) {
      query.userId = userId;
    }
    if (authorId) {
      query.listing = { userId: authorId };
    }

    const cancelledReservations = await prisma.cancelledReservation.findMany({
      where: query,
      include: {
        listing: true,
      },
      orderBy: {
        cancelledAt: 'desc',
      },
    });

    const safeCancelledReservations = cancelledReservations.map((reservation) => ({
      ...reservation,
      cancelledAt: reservation.cancelledAt.toISOString(),
      startDate: reservation.startDate.toISOString(),
      endDate: reservation.endDate.toISOString(),
      listing: {
        ...reservation.listing,
        createdAt: reservation.listing.createdAt.toISOString(),
      },
    } as SafeCancelledReservations));

    return safeCancelledReservations;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching cancelled reservations:", err.message);
    throw new Error(`Failed to fetch cancelled reservations: ${err.message}`);
  }
}

export async function getRevenue(authorId: string): Promise<{
  totalRevenue: number;
  revenueByProperty: { listingId: string; title: string; revenue: number }[];
}> {
  try {
    if (!authorId) {
      throw new Error("Author ID is required");
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        listing: { userId: authorId },
        status: "success",
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const revenueByPropertyMap = new Map<string, { title: string; revenue: number }>();
    let totalRevenue = 0;

    for (const reservation of reservations) {
      if (!reservation.listing) {
        console.warn(`Reservation ${reservation.id} has no associated listing. Skipping.`);
        continue;
      }

      const listingId = reservation.listing.id;
      const title = reservation.listing.title;
      const revenue = reservation.totalPrice;

      totalRevenue += revenue;

      const existing = revenueByPropertyMap.get(listingId);
      if (existing) {
        existing.revenue += revenue;
      } else {
        revenueByPropertyMap.set(listingId, { title, revenue });
      }
    }

    const revenueByProperty = Array.from(revenueByPropertyMap.entries()).map(
      ([listingId, { title, revenue }]) => ({
        listingId,
        title,
        revenue,
      })
    );

    return {
      totalRevenue,
      revenueByProperty,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching revenue:", err.message);
    throw new Error(`Failed to fetch revenue: ${err.message}`);
  }
}