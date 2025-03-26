"use client";

import { useState, useEffect, useRef } from "react";
import { SafeUser, safelisting } from "@/app/types";
import ListingCards from "./listings/ListingCards";
import { IlistingsParams } from "@/app/actions/getListings";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

interface ClientInfiniteScrollWrapperProps {
  initialListings: safelisting[];
  initialPage: number;
  totalPages: number;
  searchParams: IlistingsParams;
  currentUser: SafeUser | null;
  limit: number;
}

const ClientInfiniteScrollWrapper: React.FC<ClientInfiniteScrollWrapperProps> = ({
  initialListings,
  initialPage,
  totalPages,
  searchParams,
  currentUser,
  limit,
}) => {
  const searchParams_ = useSearchParams();
  const category = searchParams_?.get('category');

  const [listings, setListings] = useState<safelisting[]>(initialListings);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(currentPage < totalPages);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reset listings when category changes
  useEffect(() => {
    setListings(initialListings);
    setCurrentPage(initialPage);
    setHasMore(initialPage < totalPages);
  }, [category, initialListings, initialPage, totalPages]);

  // Function to fetch more listings
  const fetchMoreListings = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      // Construct query parameters
      const queryParams = new URLSearchParams({
        page: (currentPage + 1).toString(),
        limit: limit.toString(),
        ...(category ? { category } : {}),
        ...Object.fromEntries(
          Object.entries(searchParams).filter(([, v]) => v != null)
        )
      });

      const response = await fetch(`/api/listings?${queryParams.toString()}`);
      const data = await response.json();

      if (data.listings && data.listings.length > 0) {
        setListings((prev) => [...prev, ...data.listings]);
        setCurrentPage((prev) => prev + 1);
        setHasMore(data.currentPage < data.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error("Failed to load more listings");
      console.error("Error fetching more listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchMoreListings();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, isLoading, category]);

  return (
    <>
      <div className="pt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
        {listings.map((listing) => (
          <ListingCards
            currentUser={currentUser}
            key={listing.id}
            data={listing}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={loadMoreRef} className="text-center py-4">
          {isLoading ? (
            <p>Loading more listings...</p>
          ) : (
            <p>Scroll down to load more</p>
          )}
        </div>
      )}
      {listings.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          No listings found for this category
        </div>
      )}
    </>
  );
};

export default ClientInfiniteScrollWrapper;