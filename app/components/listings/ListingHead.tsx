"use client";

import { useState, useEffect } from 'react';
import useLocations from "@/app/hooks/useLocations";
import { SafeUser } from "@/app/types";
import Heading from "../Heading";
import Image from "next/image";
import HeartButton from "../HeartButton";

interface ListingHeadProps {
  title: string;
  locationValue: string;
  imageSrc: string[];
  id: string;
  currentUser?: SafeUser | null;
}

interface LocationInfo {
  region: string;
  label: string;
}

function ListingHead({ 
  title, 
  locationValue, 
  imageSrc, 
  id, 
  currentUser 
}: ListingHeadProps) {
  const { searchLocations } = useLocations();
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const locations = await searchLocations(locationValue);
        if (locations.length > 0) {
          setLocationInfo({
            label: locations[0].city || locations[0].label,
            region: locations[0].country || locations[0].address
          });
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        // Fallback to displaying raw location value
        setLocationInfo({
          label: locationValue,
          region: 'Unknown Region'
        });
      }
    };

    fetchLocation();
  }, [locationValue, searchLocations]);

  return (
    <>
      <Heading 
        title={title} 
        subtitle={locationInfo ? `${locationInfo.region}, ${locationInfo.label}` : 'Loading location...'}
      />
      <div className="w-full h-[65vh] rounded-xl relative grid grid-rows-2 grid-cols-4 gap-2">
        {/* Larger Image */}
        <div className="row-span-2 col-span-2 relative group">
          <Image
            alt="image"
            src={imageSrc[0]} 
            fill
            className="object-cover w-full h-full rounded-xl"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-xl"></div>
          <div className="absolute top-3 right-3">
            <HeartButton listingId={id} currentUser={currentUser} />
          </div>
        </div>

        {/* Smaller Images */}
        {imageSrc.slice(1, 5).map((src, index) => (
          <div key={index} className="relative w-full h-full group">
            <Image
              alt={`image-${index + 1}`}
              src={src}
              fill
              className="object-cover w-full h-full rounded-xl"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-xl"></div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ListingHead;   