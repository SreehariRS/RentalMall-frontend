import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
    // Get the current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.error();
    }

    // Parse the request body
    const body = await request.json();
    const { 
        title, 
        description, 
        imageSrc, 
        category, 
        roomCount, 
        guestCount, 
        location, 
        price 
    } = body;

    // Validate all fields
    for (const key in body) {
        if (!body[key]) {
            return NextResponse.error(); // Return an error if any field is missing
        }
    }

    // Create the listing in the database
    try {
        const listing = await prisma.listing.create({
            data: {
                title,
                description,
                imageSrc,
                category,
                roomCount,
                guestCount,
                locationValues: location.value, // Use 'locationValues' as per your schema
                price: parseInt(price, 10),
                userId: currentUser.id, 
            },
        });

        // Return the created listing
        return NextResponse.json(listing);
    } catch (error) {
        console.error("Error creating listing:", error);
        return NextResponse.error();
    }
}
