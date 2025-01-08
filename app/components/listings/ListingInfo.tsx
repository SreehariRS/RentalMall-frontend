'use client'

import useCountries from "@/app/hooks/useCountries"
import { SafeUser } from "@/app/types"
import { IconType } from "react-icons"
import Avatar from "../Avatar"
import ListingCategory from "./ListingCategory"
import dynamic from "next/dynamic"

const Map = dynamic(()=>import('../Map'),{
    ssr:false
})

interface ListingInfoProps {
    user: SafeUser | null; // Changed to allow null
    description: string;
    guestCount: number;
    roomCount: number; // Changed from string to number to match schema
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
    guestCount,
    roomCount,
    category,
    locationValues
}: ListingInfoProps) {
    const { getByValues } = useCountries()
    const coordinates = getByValues(locationValues)?.latlng

    return (
        <div className="col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <div className="text-xl font-semibold flex flex-row items-center gap-2">
                    <div>{user ? `Hosted by ${user.name}` : 'Host unavailable'}</div>
                    <Avatar src={user?.image} />
                </div>
                <div className="flex flex-row items-center gap-4 font-light text-neutral-500">
                    <div>
                        {roomCount} {roomCount === 1 ? 'room' : 'rooms'}
                    </div>
                 
                </div>
            </div>
            <hr />
        {category &&(
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
        <Map center={coordinates}/>
        </div>
    )
}

export default ListingInfo