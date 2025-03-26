import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { generateVerificationToken } from "@/app/libs/Token"; // Reuse token generation logic
import { sendForgotPasswordEmail } from "@/app/libs/mail"; // New function for reset email

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist to prevent enumeration
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    // Generate a reset token (reusing verification token logic)
    const resetToken = await generateVerificationToken(email);

    // Send reset email
    await sendForgotPasswordEmail(email, resetToken.token);

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error: unknown) {
    console.error("Error in /api/forgot-password:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}