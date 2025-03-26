import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function PUT(request: Request, context: any) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = context.params as { listingId?: string };
  if (!listingId || typeof listingId !== "string") {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const { price } = body;

  if (typeof price !== "number" || price <= 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const listing = await prisma.listing.updateMany({
    where: {
      id: listingId,
      userId: currentUser.id,
    },
    data: {
      price,
    },
  });

  if (listing.count === 0) {
    return NextResponse.json({ error: "Listing not found or unauthorized" }, { status: 404 });
  }

  return NextResponse.json({ message: "Price updated successfully" });
}