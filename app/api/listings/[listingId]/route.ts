import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

export async function DELETE(request: Request, context: any) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = context.params as { listingId?: string };
  if (!listingId || typeof listingId !== "string") {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const reservations = await prisma.reservation.findMany({
    where: { listingId },
    include: {
      user: { select: { id: true, email: true } },
      listing: true,
    },
  });

  if (reservations.length > 0) {
    for (const reservation of reservations) {
      const notification = await prisma.notification.create({
        data: {
          userId: reservation.userId,
          message: `We’re truly sorry to inform you that your reservation for "${reservation.listing.title}" has been canceled as the property is no longer available. We understand this may be frustrating, and we sincerely apologize for any inconvenience this may have caused.`,
          type: "error",
          isRead: false,
        },
      });

      if (reservation.user?.email) {
        await pusherServer.trigger(
          `user-${reservation.user.email}-notifications`,
          "notification:new",
          notification
        );
      }
    }
  }

  const listing = await prisma.listing.deleteMany({
    where: { id: listingId, userId: currentUser.id },
  });

  if (listing.count === 0) {
    return NextResponse.json({ error: "Listing not found or unauthorized" }, { status: 404 });
  }

  return NextResponse.json(listing);
}

export async function PUT(request: Request, context: any) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = context.params as { listingId?: string };
    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
    }

    const body = await request.json();
    const { category, imageSrc, title, description, price } = body;

    // Validation
    if (!category || typeof category !== "string") {
      return NextResponse.json({ error: "Invalid or missing category" }, { status: 400 });
    }
    if (!imageSrc || !Array.isArray(imageSrc) || imageSrc.length !== 5 || !imageSrc.every((url) => typeof url === "string")) {
      return NextResponse.json({ error: "Exactly 5 valid image URLs are required" }, { status: 400 });
    }
    if (!title || typeof title !== "string" || !description || typeof description !== "string") {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    // Convert price to a number if it's a string
    const priceNum = typeof price === "string" ? parseInt(price, 10) : price;
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }

    const listing = await prisma.listing.updateMany({
      where: { id: listingId, userId: currentUser.id },
      data: {
        category,
        imageSrc,
        title,
        description,
        price: priceNum, // Use the converted number
      },
    });

    if (listing.count === 0) {
      return NextResponse.json({ error: "Listing not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Listing updated successfully" });
  } catch (error: any) {
    console.error("Error in PUT /api/listings/[listingId]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}