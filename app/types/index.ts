import { Listing, User } from "@prisma/client";
export type safelisting = Omit<Listing, "createdAt"> & {
    createdAt: string; // Serialized ISO string
  };
  

export type SafeUser =Omit<
User,
"createdAt" | "updatedAt" |"emailVerified"

> & {
    createdAt:string;
    updatedAt :string;
    emailVerified :string |null
}                     