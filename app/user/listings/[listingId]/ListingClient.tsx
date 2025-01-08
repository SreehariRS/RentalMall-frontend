'use client'

import Container from "@/app/components/Container"
import ListingHead from "@/app/components/listings/ListingHead"
import ListingInfo from "@/app/components/listings/ListingInfo"
import { categories } from "@/app/components/Navbar/Categories"
import { safelisting, SafeUser } from "@/app/types"
import { Reservation } from "@prisma/client"
import { useMemo } from "react"

interface ListingClientProps {
    reservation?: Reservation;
    listing: safelisting & {
        user: SafeUser | null;
        createdAt: string;
    };
    currentUser?: SafeUser | null;
}

function ListingClient({ listing, currentUser }: ListingClientProps) {
    const category = useMemo(() => {
        return categories.find((item) => item.label === listing.category)
    }, [listing.category])

    return (
        <Container>
            <div className="max-w-screen-lg mx-auto">
                <div className="flex flex-col gap-6">
                    <ListingHead
                        title={listing.title}
                        imageSrc={listing.imageSrc}
                        locationValue={listing.locationValues}
                        id={listing.id}
                        currentUser={currentUser}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
                        <ListingInfo
                            user={listing.user}
                            category={category}
                            description={listing.description}
                            guestCount={listing.guestCount}
                            roomCount={listing.roomCount}
                            locationValues={listing.locationValues}
                        />
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default ListingClient