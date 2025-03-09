"use client";

import Container from "@/app/components/Container";
import ListingHead from "@/app/components/listings/ListingHead";
import ListingInfo from "@/app/components/listings/ListingInfo";
import ListingReservation from "@/app/components/listings/ListingReservation";
import MeetTheHost from "@/app/components/listings/MeetTheHost";
import Review from "@/app/components/listings/Review";
import { categories } from "@/app/components/Navbar/Categories";
import useLoginModal from "@/app/hooks/useLoginModal";
import { safelisting, safeReservations, SafeUser } from "@/app/types";
import axios from "axios";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Range } from "react-date-range";

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

interface ListingClientProps {
  reservations?: safeReservations[];
  listing: safelisting & {
    user: SafeUser | null;
    createdAt: string;
  };
  currentUser?: SafeUser | null;
}

function ListingClient({ listing, reservations = [], currentUser }: ListingClientProps) {
  const loginModal = useLoginModal();
  const router = useRouter();

  const disableDates = useMemo(() => {
    let dates: Date[] = [];
    reservations.forEach((reservation) => {
      const range = eachDayOfInterval({
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate),
      });
      dates = [...dates, ...range];
    });
    return dates;
  }, [reservations]);

  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(listing.price);
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);
  const [reviews, setReviews] = useState<any[]>([]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`/api/reviews?listingId=${listing.id}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }, [listing.id]);

  const onCreateReservation = useCallback(() => {
    if (!currentUser) {
      loginModal.onOpen();
      return;
    }
    setIsLoading(true);
    axios
      .post("/api/reservations", {
        totalPrice,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        listingId: listing?.id,
      })
      .then(() => {
        toast.success("Listing reserved!");
        setDateRange(initialDateRange);
        router.push("/trips");
      })
      .catch(() => {
        toast.error("Something went wrong!");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [totalPrice, dateRange, listing?.id, router, currentUser, loginModal]);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const dayCount = differenceInCalendarDays(dateRange.endDate, dateRange.startDate) + 1; // Add 1 to include both start and end dates
      const basePrice = listing.offerPrice !== undefined && listing.offerPrice !== null ? listing.offerPrice : listing.price;
      console.log("Day count:", dayCount); // Debug log
      console.log("Base price:", basePrice); // Debug log
      console.log("Calculated total:", dayCount * basePrice); // Debug log
      if (dayCount && basePrice) {
        setTotalPrice(dayCount * basePrice);
      } else {
        setTotalPrice(basePrice);
      }
    }
  }, [dateRange, listing.price, listing.offerPrice]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const category = useMemo(() => {
    return categories.find((item) => item.label === listing.category);
  }, [listing.category]);

  const handleMessageHost = useCallback(() => {
    if (!currentUser) {
      loginModal.onOpen();
      return;
    }
    console.log("Message Host clicked");
  }, [currentUser, loginModal]);

  const isOwnListing = useMemo(() => {
    return currentUser?.id === listing.user?.id;
  }, [currentUser, listing.user]);

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
              roomCount={listing.roomCount}
              locationValues={listing.locationValues}
            />
            <div className="order-first mb-10 md:order-last md:col-span-3">
              <ListingReservation
                price={listing.price}
                offerPrice={listing.offerPrice}
                totalPrice={totalPrice}
                onChangeDates={(value) => setDateRange(value)}
                dateRange={dateRange}
                onSubmit={onCreateReservation}
                disabled={isLoading || isOwnListing}
                disabledDates={disableDates}
                listingId={listing.id}
              />
            </div>
          </div>

          <div className="mt-10">
            <MeetTheHost
              hostName={listing.user?.name || "Host"}
              hostImage={listing.user?.image}
              hostingSince={new Date(listing.user?.createdAt || "2020-01-01").toLocaleDateString()}
              experienceInMonths={Math.floor(
                (new Date().getTime() - new Date(listing.user?.createdAt || "2020-01-01").getTime()) /
                  (1000 * 60 * 60 * 24 * 30)
              )}
              onMessageHost={handleMessageHost}
              currentUser={currentUser}
            />
          </div>

          <div className="mt-10">
            <Review reviews={reviews} currentUser={currentUser} onReviewChange={fetchReviews} />
          </div>
        </div>
      </div>
    </Container>
  );
}

export default ListingClient;