import { NextResponse } from "next/server";
import prisma from '@/app/libs/prismadb';
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/app/libs/pusher";
import { getOrCreateWallet } from "@/app/actions/getWallet";

interface IParams {
  reservationId?: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.error();
  }
  const { reservationId } = params;
  if (!reservationId || typeof reservationId !== "string") {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { 
          listing: true,
          user: {
            select: {
              email: true,
              id: true
            }
          }
        }
      });
      if (!reservation) {
        throw new Error("Reservation not found");
      }

      if (reservation.userId !== currentUser.id && reservation.listing.userId !== currentUser.id) {
        throw new Error("Unauthorized");
      }

      const guestWallet = await getOrCreateWallet(reservation.userId);

      const updatedWallet = await prisma.wallet.update({
        where: { userId: reservation.userId },
        data: {
          balance: {
            increment: reservation.totalPrice,
          },
        },
      });

      await prisma.cancelledReservation.create({
        data: {
          reservationId: reservation.id,
          userId: reservation.userId,
          listingId: reservation.listingId,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          totalPrice: reservation.totalPrice,
          cancelledBy: currentUser.id,
          reason: "Cancelled by " + (currentUser.id === reservation.userId ? "guest" : "host")
        }
      });

      await prisma.reservation.delete({
        where: { id: reservationId }
      });

      if (currentUser.id === reservation.listing.userId) {
        const notification = await prisma.notification.create({
          data: {
            userId: reservation.userId,
            message: `Unfortunately, your reservation for "${reservation.listing.title}" has been canceled due to an unexpected issue. The total amount of ₹${reservation.totalPrice} will be refunded to your wallet. We apologize for any inconvenience caused and appreciate your understanding.`,
            type: "info"
          }
        });

        if (reservation.user?.email) {
          await pusherServer.trigger(
            `user-${reservation.user.email}-notifications`,
            'notification:new',
            notification
          );
        }
      }

      return { success: true, refundedAmount: reservation.totalPrice, newBalance: updatedWallet.balance };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Deletion error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}