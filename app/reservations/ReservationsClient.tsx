"use client"

import { useRouter } from "next/navigation"
import axios from "axios"
import Container from "../components/Container"
import Heading from "../components/Heading"
import { safeReservations, SafeUser } from "../types"
import { useCallback, useState } from "react"
import toast from "react-hot-toast"
import ListingCards from "../components/listings/ListingCards"

interface ReservationsClientProps {
    reservations: safeReservations[]
    currentUser?: SafeUser | null
}

function ReservationsClient({ reservations, currentUser }: ReservationsClientProps) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState('')

    const onCancel = useCallback((id: string) => {
        setDeletingId(id)
        axios.delete(`api/reservations/${id}`)
            .then(() => {
                toast.success("Reservation Cancelled")
                router.refresh()
            })
            .catch(() => {
                toast.error("Something Went Wrong")
            })
            .finally(() => {
                setDeletingId('')
            })
    }, [router])

    // Function to check if reservation is expired
    const isReservationExpired = (reservationDate: string) => {
        const currentDate = new Date();
        const resDate = new Date(reservationDate);
        
        // Set time to 0 for both dates to compare only the date part
        currentDate.setHours(0, 0, 0, 0);
        resDate.setHours(0, 0, 0, 0);

        // Return true if current date is strictly greater than reservation date
        return currentDate > resDate;
    }

    return (
        <Container>
            <Heading
                title="Reservations"
                subtitle="Bookings on your Properties"
            />
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                {
                    reservations.map((reservation) => {
                        // Determine if the reservation is expired
                        const isExpired = isReservationExpired(reservation.endDate);
                        
                        return (
                            <ListingCards
                                key={reservation.id}
                                data={reservation.listing}
                                reservation={reservation}
                                actionId={reservation.id}
                                onAction={onCancel}
                                // Disable if either deleting or reservation is expired
                                disabled={deletingId === reservation.id || isExpired}
                                actionLabel="cancel guest reservation"
                                currentUser={currentUser}
                            />
                        )
                    })
                }
            </div>
        </Container>
    )
}

export default ReservationsClient