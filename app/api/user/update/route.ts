// app/api/user/update/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { about, image } = body;

  if (about !== undefined && typeof about !== "string") {
    return NextResponse.json({ error: "Invalid input: 'about' must be a string" }, { status: 400 });
  }
  if (image !== undefined && typeof image !== "string") {
    return NextResponse.json({ error: "Invalid input: 'image' must be a string" }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(about !== undefined && { about }),
        ...(image !== undefined && { image }),
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        about: updatedUser.about,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}