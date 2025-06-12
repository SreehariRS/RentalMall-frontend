"use client"

import { useRouter } from "next/navigation";
import axios from "axios";
import Container from "../components/Container";
import Heading from "../components/Heading";
import { safeReservations, SafeUser, RevenueData } from "../types";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import ListingCards from "../components/listings/ListingCards";

interface ReservationsClientProps {
  reservations: safeReservations[];
  currentUser?: SafeUser | null;
  revenueData: RevenueData;
}

function ReservationsClient({ reservations, currentUser, revenueData }: ReservationsClientProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState('');

  const onCancel = useCallback((id: string) => {
    setDeletingId(id);
    axios.delete(`api/reservations/${id}`)
      .then(() => {
        toast.success("Reservation Cancelled");
        router.refresh();
      })
      .catch(() => {
        toast.error("Something Went Wrong");
      })
      .finally(() => {
        setDeletingId('');
      });
  }, [router]);

  const isReservationExpired = (reservationDate: string) => {
    const currentDate = new Date();
    const resDate = new Date(reservationDate);

    currentDate.setHours(0, 0, 0, 0);
    resDate.setHours(0, 0, 0, 0);

    return currentDate > resDate;
  };

  return (
    <Container>
      <Heading
        title="Reservations"
        subtitle="Bookings on your Properties"
      />
      <div className="mt-6">
        <h2 className="text-2xl font-semibold">Revenue Overview</h2>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-lg font-medium">
            Total Revenue: <span className="text-green-600">₹{revenueData.totalRevenue}</span>
          </p>
          <h3 className="text-lg font-medium mt-4">Revenue by Property</h3>
          {revenueData.revenueByProperty.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {revenueData.revenueByProperty.map((property) => (
                <li key={property.listingId} className="flex justify-between">
                  <span>{property.title}</span>
                  <span className="font-medium">₹{property.revenue}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No revenue data available for properties.</p>
          )}
        </div>
      </div>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
        {reservations.map((reservation) => {
          const isExpired = isReservationExpired(reservation.endDate);

          const bookingUser = {
            name: reservation.user?.name || "Unknown User",
            email: reservation.user?.email || "No email provided",
          };

          return (
            <div key={reservation.id} className="relative">
              <ListingCards
                data={reservation.listing}
                reservation={reservation}
                actionId={reservation.id}
                onAction={onCancel}
                disabled={deletingId === reservation.id || isExpired}
                actionLabel="cancel guest reservation"
                currentUser={currentUser}
              />
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  Booked by: <span className="font-medium">{bookingUser.name}</span>
                </p>
                <p>Email: <span className="font-medium">{bookingUser.email}</span></p>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
}

export default ReservationsClient;