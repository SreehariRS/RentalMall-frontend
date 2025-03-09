export { default } from "next-auth/middleware";
export const config = {
  matcher: [
    "/user/profile",
    "/user/favorite",
    "/properties",
    "/conversations",
    "/reservations",
    "/notifications",
    "/trips",
  ],
};