import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import getListings, { IlistingsParams } from "@/app/actions/getListings";

// Existing POST handler for creating listings
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Image URLs received:", body.imageSrc);

    const {
      title,
      description,
      imageSrc,
      category,
      roomCount,
      guestCount,
      location,
      price,
    } = body;

    // Validate imageSrc
    if (!imageSrc || !Array.isArray(imageSrc)) {
      return NextResponse.json(
        { error: "imageSrc must be an array of strings" },
        { status: 400 }
      );
    }

    // Ensure all URLs in imageSrc are strings
    const validUrls = imageSrc.filter((url: any) => typeof url === "string" && url.trim() !== "");
    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: "At least one valid image URL is required" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        imageSrc: validUrls,
        category,
        roomCount,
        guestCount,
        locationValues: location.value,
        price: parseInt(price, 10),
        userId: currentUser.id,
      },
    });

    console.log("Final listing created:", listing);
    return NextResponse.json(listing);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to create listing" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

// New GET handler for fetching paginated listings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 12);
    const limit = parseInt(searchParams.get("limit") || "12", 12);

    const params: IlistingsParams = {
      userId: searchParams.get("userId") || undefined,
      guestCount: searchParams.get("guestCount")
        ? parseInt(searchParams.get("guestCount")!, 10)
        : undefined,
      roomCount: searchParams.get("roomCount")
        ? parseInt(searchParams.get("roomCount")!, 10)
        : undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      locationValue: searchParams.get("locationValue") || undefined,
      category: searchParams.get("category") || undefined,
      page,
      limit,
    };

    const data = await getListings(params);
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch listings" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}