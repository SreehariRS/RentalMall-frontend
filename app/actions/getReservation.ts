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
        user: {  // Include user data
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

    const safeReservations = reservations.map((reservation) => {
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
          ...reservation.listing,
          createdAt: reservation.listing.createdAt.toISOString(),
        },
        user: {  // Add user data to the returned object
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

// getCancelledReservations remains unchanged unless you want user data there too
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