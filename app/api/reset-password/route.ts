import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import bcrypt from "bcrypt";
import { getVerificationTokenByToken } from "@/app/data/verification-token";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    // Verify the token
    const resetToken = await getVerificationTokenByToken(token);
    if (!resetToken || new Date() > resetToken.expires) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update the user's password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { hashedPassword },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: resetToken.id },
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error: unknown) {
    console.error("Error in /api/reset-password:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}