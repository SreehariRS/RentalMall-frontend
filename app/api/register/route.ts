import bcrypt from "bcrypt";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";
import { generateVerificationToken } from "@/app/libs/Token";
import { sendVerificationEmail } from "@/app/libs/mail";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, name, password } = body;

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Missing required fields: email, name, or password." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    // Generate a verification token
    const verificationToken = await generateVerificationToken(email);

    // Send verification email
    await sendVerificationEmail(email, verificationToken.token);

    return NextResponse.json({
      message: "User created successfully. Email verification sent.",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error: any) {
    console.error("Error in /api/register:", error);
    return NextResponse.json(
      {
        error: "Something went wrong while creating the user.",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
