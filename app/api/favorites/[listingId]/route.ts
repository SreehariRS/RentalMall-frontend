import { NextResponse, type NextRequest } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

// Define the type for the context parameter
interface RouteContext {
  params: { listingId: string }; // Make listingId required, not optional
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract params correctly
    const { listingId } = context.params;

    if (!listingId || typeof listingId !== "string") {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    let favoriteIds = [...(currentUser.favoriteIds || [])];
    if (favoriteIds.includes(listingId)) {
      return new NextResponse("Listing already in favorites", { status: 400 });
    }

    favoriteIds.push(listingId);

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: { favoriteIds },
    });

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error("FAVORITES_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract params correctly
    const { listingId } = context.params;

    if (!listingId || typeof listingId !== "string") {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    let favoriteIds = [...(currentUser.favoriteIds || [])];
    if (!favoriteIds.includes(listingId)) {
      return new NextResponse("Listing not in favorites", { status: 400 });
    }

    favoriteIds = favoriteIds.filter((id) => id !== listingId);

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: { favoriteIds },
    });

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error("FAVORITES_DELETE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}