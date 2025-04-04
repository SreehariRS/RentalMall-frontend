import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getReservations from "@/app/actions/getReservation";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const { listingId, startDate, endDate, totalPrice, orderId, paymentId, status } = body;

  if (!listingId || !startDate || !endDate || !totalPrice || !orderId) {
    return NextResponse.error();
  }

  const newStartDate = new Date(startDate);
  const newEndDate = new Date(endDate);

  const existingReservations = await prisma.reservation.findMany({
    where: {
      listingId: listingId,
      status: { not: "failed" },
      OR: [
        {
          startDate: {
            lte: newEndDate,
          },
          endDate: {
            gte: newStartDate,
          },
        },
      ],
    },
  });

  const hasOverlap = existingReservations.length > 0;

  if (hasOverlap) {
    return NextResponse.json(
      {
        success: false,
        error: "This property is already reserved for these dates.",
      },
      { status: 400 }
    );
  }

  try {
    const listingAndReservation = await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        reservations: {
          create: {
            userId: currentUser.id,
            startDate: newStartDate,
            endDate: newEndDate,
            totalPrice,
            orderId,
            paymentId,
            status,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: listingAndReservation,
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create reservation",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");

    if (!authorId) {
      return NextResponse.json({ error: "Author ID is required" }, { status: 400 });
    }

    // Fetch reservations where the current user is the listing owner
    const reservations = await getReservations({ authorId });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}