import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(request: Request, context: any) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.error();
  }

  const { listingId } = context.params as { listingId?: string };
  if (!listingId || typeof listingId !== "string") {
    throw new Error("Invalid ID");
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeReservations = await prisma.reservation.findMany({
      where: {
        listingId: listingId,
        endDate: {
          gte: today,
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json(activeReservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.error();
  }
}