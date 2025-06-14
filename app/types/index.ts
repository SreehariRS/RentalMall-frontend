import { Listing, Reservation, User, CancelledReservation, Conversation, Message } from "@prisma/client";

export type FullMessageType = Message & {
  sender: User;
  seen: User[];
};

export type FullConversationType = Conversation & {
  users: User[];
  messages: FullMessageType[];
};

export type safelisting = Omit<Listing, "createdAt"> & {
  createdAt: string;
  offerPrice: number | null;
  rating?: number | null;
};

export type safeReservations = Omit<Reservation, "createdAt" | "startDate" | "endDate" | "listing"> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  listing: safelisting;
  canCancel?: boolean;
  user: {
    name: string;
    email: string;
  };
};

export type SafeCancelledReservations = Omit<CancelledReservation, "cancelledAt" | "startDate" | "endDate" | "listing"> & {
  cancelledAt: string;
  startDate: string;
  endDate: string;
  listing: safelisting;
};

export type SafeUser = Omit<User, "createdAt" | "updatedAt" | "emailVerified"> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};

export type RevenueData = {
  totalRevenue: number;
  revenueByProperty: {
    listingId: string;
    title: string;
    revenue: number;
  }[];
};