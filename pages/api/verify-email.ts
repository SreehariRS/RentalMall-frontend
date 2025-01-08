import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/app/libs/prismadb";
import cookie from "cookie";

// You may want to securely store this in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "1h"; // Example expiration time (1 hour)
const JWT_EXPIRATION_TIME = 60 * 60 * 24; // 24 hours (in seconds)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { email } = req.body;

        // Verify the user (this should be done using your authentication logic)
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Create the JWT token
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        // Set the JWT token in a cookie
        res.setHeader('Set-Cookie', cookie.serialize('jwt', token, {
            httpOnly: true, // Cookie can't be accessed by JavaScript
            secure: process.env.NODE_ENV === 'production', // Set cookie only over HTTPS in production
            maxAge: JWT_EXPIRATION_TIME, // Cookie expires after 24 hours
            path: '/', // Cookie will be available throughout the entire site
        }));

        return res.status(200).json({ message: "Login successful" });
    }

    return res.status(405).json({ message: "Method Not Allowed" });
}
