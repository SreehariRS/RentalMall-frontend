"use client";

import useLocations from "@/app/hooks/useLocations";
import type { SafeCancelledReservations, safelisting, safeReservations, SafeUser } from "@/app/types";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import Image from "next/image";
import HeartButton from "../HeartButton";
import Button from "../Button";
import { ChevronLeft, ChevronRight, Gift, Tag } from "lucide-react";
import axios from "axios";

interface ListingCardProps {
  data: safelisting;
  reservation?: safeReservations | SafeCancelledReservations;
  onAction?: (id: string) => void;
  onOffer?: (id: string, price: number) => void;
  disabled?: boolean;
  actionLabel?: string;
  actionId?: string;
  currentUser?: SafeUser | null;
}

interface LocationInfo {
  label: string;
  region: string;
}

// Define a type for reviews
interface Review {
  rating: number;
  [key: string]: unknown; // Allow for additional properties if needed
}

const ListingCards = ({
  data,
  reservation,
  onAction,
  onOffer,
  disabled,
  actionId = "",
  actionLabel,
  currentUser,
}: ListingCardProps) => {
  const router = useRouter();
  const { searchLocations } = useLocations();
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  const fetchedLocationRef = useRef<string | null>(null);

  // Fetch location info
  useEffect(() => {
    if (!data.locationValues || fetchedLocationRef.current === data.locationValues) {
      return;
    }

    const fetchLocation = async () => {
      try {
        const locations = await searchLocations(data.locationValues);
        if (locations.length > 0) {
          setLocationInfo({
            label: locations[0].city || locations[0].label,
            region: locations[0].country || locations[0].address,
          });
        }
        fetchedLocationRef.current = data.locationValues;
      } catch (error) {
        console.error("Error fetching location:", error);
        setLocationInfo({ label: data.locationValues, region: "Unknown Region" });
      }
    };

    fetchLocation();
  }, [data.locationValues, searchLocations]);

  // Fetch reviews and calculate average rating
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`/api/reviews?listingId=${data.id}`);
        const reviews: Review[] = response.data; // Type the response data as Review[]
        if (reviews.length > 0) {
          const avgRating = reviews.reduce((acc: number, review: Review) => acc + review.rating, 0) / reviews.length;
          setAverageRating(avgRating);
        } else {
          setAverageRating(0); // No reviews yet
        }
      } catch (error) {
        console.error("Error fetching reviews for rating:", error);
        setAverageRating(null); // Handle error gracefully
      }
    };

    fetchReviews();
  }, [data.id]);

  const images = Array.isArray(data.imageSrc) ? data.imageSrc : [data.imageSrc];

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (disabled) return;
      onAction?.(actionId);
    },
    [onAction, actionId, disabled],
  );

  const handleOffer = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (disabled) return;
      onOffer?.(actionId, data.price);
    },
    [onOffer, actionId, disabled, data.price],
  );

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const price = useMemo(() => {
    return reservation ? reservation.totalPrice : data.offerPrice || data.price;
  }, [reservation, data.offerPrice, data.price]);

  const discountPercentage = useMemo(() => {
    if (!data.offerPrice || !data.price) return null;
    const discount = ((data.price - data.offerPrice) / data.price) * 100;
    return Math.round(discount);
  }, [data.offerPrice, data.price]);

  const reservationDate = useMemo(() => {
    if (!reservation) return null;
    if ("cancelledAt" in reservation) {
      return `Cancelled on ${new Date(reservation.cancelledAt).toLocaleDateString()}`;
    }
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    return `${format(start, "PP")} - ${format(end, "PP")}`;
  }, [reservation]);

  // Function to render single star rating
  const renderRating = (rating: number | null) => {
    if (rating === null || rating === 0) return null; // Hide if no rating or loading
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-black drop-shadow-sm">★</span>
        <span className="font-medium text-gray-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div onClick={() => router.push(`/user/listings/${data.id}`)} className="col-span-1 cursor-pointer group">
      <div className="flex flex-col gap-2 w-full">
        <div className="aspect-square w-full relative overflow-hidden rounded-xl">
          <Image
            fill
            alt="Listing"
            src={images[currentImageIndex] || "/placeholder.svg"}
            className="object-cover h-full w-full group-hover:scale-110 transition"
          />
          {data.offerPrice && (
            <div className="absolute top-2 left-2 z-10">
              <div className="bg-red-600 text-white px-2 py-0.5 rounded text-xs shadow-md flex items-center gap-0.5 font-medium transform -rotate-2 animate-pulse">
                <Tag className="w-3 h-3" />
                <span>{discountPercentage}% OFF</span>
              </div>
            </div>
          )}
          <div className="hidden group-hover:flex items-center justify-between w-full absolute top-1/2 transform -translate-y-1/2 px-4">
            <button
              onClick={prevSlide}
              className="bg-white/70 rounded-full p-2 hover:bg-white transition"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="bg-white/70 rounded-full p-2 hover:bg-white transition"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          {images.length > 1 && (
            <div className="hidden group-hover:block absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
          <div className="absolute top-3 right-3">
            <HeartButton listingId={data.id} currentUser={currentUser} />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="font-semibold text-lg">
            {locationInfo ? `${locationInfo.region}` : "Loading location..."}
          </div>
          {renderRating(averageRating)}
        </div>
        <div className="font-light text-neutral-500">{reservationDate || data.category}</div>
        <div className="flex flex-row items-center gap-1">
          <div className="font-semibold">₹ {price}</div>
          {!reservation && <div className="font-light">/Day</div>}
          {data.offerPrice && <div className="text-sm text-gray-500 line-through">₹ {data.price}</div>}
        </div>
        <div className="flex gap-2 items-center">
          {onAction && actionLabel && <Button disabled={disabled} small label={actionLabel} onClick={handleCancel} />}
          {onOffer && (
            <button
              onClick={handleOffer}
              disabled={disabled}
              className="p-2 border border-neutral-200 rounded-md hover:bg-neutral-100 disabled:opacity-50 transition"
              aria-label="Make an offer"
            >
              <Gift className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCards;