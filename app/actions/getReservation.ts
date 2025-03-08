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

    // Define a more specific type for the query object
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const safeReservations = reservations.map((reservation) => {
      const reservationCreatedTime = new Date(reservation.createdAt);
      const timeDiff = new Date().getTime() - reservationCreatedTime.getTime();
      const canCancel = timeDiff <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      return {
        ...reservation,
        canCancel, // Add the "canCancel" flag dynamically
        orderId: reservation.orderId ?? 'No Order ID', // Handle null orderId with a fallback
        createdAt: reservation.createdAt.toISOString(),
        startDate: reservation.startDate.toISOString(),
        endDate: reservation.endDate.toISOString(),
        listing: {
          ...reservation.listing,
          createdAt: reservation.listing.createdAt.toISOString(),
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

    // Define a more specific type for the query object
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