import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { listingId, reservationId, rating, title, content } = body;

  if (!listingId || !reservationId || !rating || !title || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Check if a review already exists for this user and reservation
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: currentUser.id,
        reservationId,
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this reservation" }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        userId: currentUser.id,
        listingId,
        reservationId, // Include reservationId
        rating,
        title,
        content,
        verified: true,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error posting review:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");

  if (!listingId) {
    return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { listingId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    const safeReviews = reviews.map((review) => ({
      id: review.id,
      author: review.user.name || "Anonymous",
      date: review.createdAt.toISOString(),
      rating: review.rating,
      title: review.title,
      content: review.content,
      helpfulCount: review.helpfulCount,
      verified: review.verified,
      userId: review.userId,
    }));

    return NextResponse.json(safeReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get("reviewId");

  if (!reviewId) {
    return NextResponse.json({ error: "Missing reviewId" }, { status: 400 });
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.userId !== currentUser.id) {
      return NextResponse.json({ error: "You can only delete your own reviews" }, { status: 403 });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { reviewId, rating, title, content } = body;

  if (!reviewId || !rating || !title || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.userId !== currentUser.id) {
      return NextResponse.json({ error: "You can only edit your own reviews" }, { status: 403 });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        title,
        content,
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}