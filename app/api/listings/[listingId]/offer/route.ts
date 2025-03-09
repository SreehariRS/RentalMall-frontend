import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

// PUT handler
export async function PUT(
  request: Request,
  context: any // Temporarily use 'any' to bypass the type mismatch
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = context.params as { listingId?: string }; // Cast to expected type

  if (!listingId || typeof listingId !== "string") {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const { offerPrice } = body;

  // Check if offerPrice is null or a valid number
  if (offerPrice !== null && (typeof offerPrice !== "number" || offerPrice <= 0)) {
    return NextResponse.json({ error: "Invalid offer price" }, { status: 400 });
  }

  const listing = await prisma.listing.updateMany({
    where: {
      id: listingId,
      userId: currentUser.id,
    },
    data: {
      offerPrice,
    },
  });

  if (listing.count === 0) {
    return NextResponse.json(
      { error: "Listing not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Offer price updated successfully" });
}