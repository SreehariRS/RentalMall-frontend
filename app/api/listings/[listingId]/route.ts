import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

export async function DELETE(request: Request, context: any) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.error();
  }

  const { listingId } = context.params as { listingId?: string };

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Invalid ID");
  }

  // Check if the property has any reservations
  const reservations = await prisma.reservation.findMany({
    where: {
      listingId: listingId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true, // Include email for Pusher channel
        },
      },
      listing: true,
    },
  });

  // If reservations exist, send notifications to users with real-time updates
  if (reservations.length > 0) {
    for (const reservation of reservations) {
      // Create a notification for each user
      const notification = await prisma.notification.create({
        data: {
          userId: reservation.userId,
          message: `
We’re truly sorry to inform you that your reservation for "${reservation.listing.title}" has been canceled as the property is no longer available. We understand this may be frustrating, and we sincerely apologize for any inconvenience this may have caused.`,
          type: "error",
          isRead: false,
        },
      });

      // Trigger Pusher event for real-time notification
      if (reservation.user?.email) {
        await pusherServer.trigger(
          `user-${reservation.user.email}-notifications`,
          "notification:new",
          notification
        );
      }
    }
  }

  // Delete the property
  const listing = await prisma.listing.deleteMany({
    where: {
      id: listingId,
      userId: currentUser.id,
    },
  });

  return NextResponse.json(listing);
}