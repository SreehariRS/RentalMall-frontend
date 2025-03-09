'use client'

import { useState, useEffect } from 'react'
import useLocations from "@/app/hooks/useLocations"
import { SafeUser } from "@/app/types"
import { IconType } from "react-icons"
import Avatar from "../Avatar"
import ListingCategory from "./ListingCategory"
import dynamic from "next/dynamic"

const Map = dynamic(() => import('../Map'), {
    ssr: false
})

interface ListingInfoProps {
    user: SafeUser | null;
    description: string;
    roomCount: number;
    category: {
        icon: IconType;
        label: string;
        description: string;
    } | undefined;
    locationValues: string;
}

function ListingInfo({
    user,
    description,
    roomCount,
    category,
    locationValues
}: ListingInfoProps) {
    const { searchLocations } = useLocations();
    const [coordinates, setCoordinates] = useState<number[] | undefined>(undefined);

    useEffect(() => {
        const fetchLocationCoordinates = async () => {
            try {
                const locations = await searchLocations(locationValues);
                if (locations.length > 0 && locations[0].coordinates) {
                    setCoordinates(locations[0].coordinates);
                }
            } catch (error) {
                console.error('Error fetching location coordinates:', error);
                setCoordinates(undefined);
            }
        };

        fetchLocationCoordinates();
    }, [locationValues, searchLocations]);

    return (
        <div className="col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <div className="text-xl font-semibold flex flex-row items-center gap-2">
                    <div>{user ? `Hosted by ${user.name}` : 'Host unavailable'}</div>
                    <Avatar src={user?.image} />
                </div>
                <div className="flex flex-row items-center gap-4 font-light text-neutral-500">
                    <div>
                        {category?.label === "car" || category?.label === "Bike"
                            ? `${roomCount} ${roomCount === 1 ? 'seat' : 'seats'}`
                            : `${roomCount} ${roomCount === 1 ? 'room' : 'rooms'}`}
                    </div>
                </div>
            </div>
            <hr />
            {category && (
                <ListingCategory
                    icon={category.icon}
                    label={category.label}
                    description={category.description}
                />
            )}
            <hr />
            <div className="text-lg font-light text-neutral-500">
                {description}
            </div>
            <hr />
            <Map center={coordinates} />
        </div>
    )
}

export default ListingInfo