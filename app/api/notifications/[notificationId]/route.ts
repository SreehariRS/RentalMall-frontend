import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/app/libs/pusher";

export async function DELETE(request: Request, context: any) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { notificationId } = context.params as { notificationId?: string };
    if (!notificationId || typeof notificationId !== "string") {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    // Delete the notification, ensuring it belongs to the current user
    const notification = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId: currentUser.id,
      },
    });

    // Trigger Pusher event for real-time notification removal
    await pusherServer.trigger(
      `user-${currentUser.email}-notifications`,
      "notification:remove",
      notificationId
    );

    return NextResponse.json(notification);
  } catch (error) {
    console.error("DELETE_NOTIFICATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}