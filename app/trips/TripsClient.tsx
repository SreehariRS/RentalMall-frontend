"use client";

import { useRouter } from "next/navigation";
import Container from "../components/Container";
import Heading from "../components/Heading";
import { SafeCancelledReservations, safeReservations, SafeUser } from "../types";
import { useCallback, useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import ListingCards from "../components/listings/ListingCards";
import EmptyState from "../components/EmptyState";

interface TripsClientProps {
  reservation: safeReservations[];
  cancelledReservations?: SafeCancelledReservations[];
  currentUser?: SafeUser | null;
  initialWalletBalance: number | null; // Added prop for initial wallet balance
}

function TripsClient({
  reservation: reservations,
  cancelledReservations = [],
  currentUser,
  initialWalletBalance,
}: TripsClientProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "cancelled">("active");
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reviewedReservations, setReviewedReservations] = useState<Set<string>>(new Set());
  const [walletBalance, setWalletBalance] = useState<number | null>(initialWalletBalance);

  const openModal = (id: string, isReview = false) => {
    setSelectedReservationId(id);
    if (isReview) {
      setReviewModalVisible(true);
    } else {
      setModalVisible(true);
    }
  };

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setReviewModalVisible(false);
    setSelectedReservationId(null);
    setRating(0);
    setTitle("");
    setContent("");
  }, []);

  const onCancel = useCallback(async () => {
    if (!selectedReservationId) return;

    const reservationToCancel = reservations.find((res: safeReservations) => res.id === selectedReservationId);

    if (reservationToCancel && !reservationToCancel.canCancel) {
      toast.error("You cannot cancel this reservation after 24 hours.");
      return;
    }

    setDeletingId(selectedReservationId);
    try {
      const response = await axios.delete(`/api/reservations/${selectedReservationId}`);
      const { success, refundedAmount, newBalance } = response.data;
      if (success) {
        toast.success(`Reservation Cancelled! ₹${refundedAmount} refunded to your wallet.`);
        setWalletBalance(newBalance); // Update local state with new balance
        router.refresh();
      } else {
        toast.error("Failed to cancel reservation");
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ error?: string }>;
      console.error("Cancellation error:", axiosError.response?.data || axiosError.message);
      toast.error(axiosError.response?.data?.error || "An error occurred");
    } finally {
      setDeletingId("");
      closeModal();
    }
  }, [router, selectedReservationId, closeModal, reservations]);

  const onSubmitReview = useCallback(() => {
    if (!selectedReservationId || !rating || !title || !content) {
      toast.error("Please fill out all fields.");
      return;
    }

    const reservation = reservations.find((res: safeReservations) => res.id === selectedReservationId);
    if (!reservation) return;

    axios
      .post("/api/reviews", {
        listingId: reservation.listingId,
        reservationId: reservation.id,
        rating,
        title,
        content,
      })
      .then(() => {
        toast.success("Review submitted!");
        setReviewedReservations((prev) => new Set(prev).add(reservation.id));
        router.refresh();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || "Failed to submit review");
      })
      .finally(() => {
        closeModal();
      });
  }, [selectedReservationId, rating, title, content, router, reservations]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchReviewedReservations = async () => {
      try {
        const listingIds = reservations.map((res) => res.listingId);
        const uniqueListingIds = [...new Set(listingIds)];

        const reviewsPromises = uniqueListingIds.map((listingId) =>
          axios.get(`/api/reviews?listingId=${listingId}`)
        );
        const responses = await Promise.all(reviewsPromises);

        const reviewed = new Set<string>();
        responses.forEach((response) => {
          const reviews = response.data;
          reviews.forEach((review: any) => {
            if (review.userId === currentUser.id && reservations.some((res) => res.id === review.reservationId)) {
              reviewed.add(review.reservationId);
            }
          });
        });

        setReviewedReservations(reviewed);
      } catch (error) {
        console.error("Error fetching reviewed reservations:", error);
      }
    };

    fetchReviewedReservations();
  }, [currentUser, reservations]);

  const currentList = activeTab === "cancelled" ? cancelledReservations : reservations;

  const isCancelled = (item: safeReservations | SafeCancelledReservations): item is SafeCancelledReservations => {
    return (item as SafeCancelledReservations).cancelledAt !== undefined;
  };

  const isBookingExpired = (endDate: string | Date) => {
    return new Date(endDate) < new Date();
  };

  const hasReviewed = (reservationId: string) => {
    return reviewedReservations.has(reservationId);
  };

  if (reservations.length === 0 && cancelledReservations.length === 0) {
    return <EmptyState title="No bookings found" subtitle="Looks like you haven't made any bookings yet." />;
  }

  const headingTitle = activeTab === "active" ? "Active Bookings" : "Cancelled Bookings";
  const headingSubtitle =
    activeTab === "active" ? "Manage and track your upcoming Rentals" : "Canceled Reservations History";

  return (
    <Container>
      <Heading title={headingTitle} subtitle={headingSubtitle} />
      <div className="mt-4">
        {walletBalance !== null && (
          <div className="mb-4 text-lg font-semibold">
            Wallet Balance: ₹{walletBalance.toFixed(2)}
          </div>
        )}
      </div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("active")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "active"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Active Bookings
            <span
              className={`ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                activeTab === "active" ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-900"
              }`}
            >
              {reservations.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "cancelled"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Cancelled Bookings
          </button>
        </nav>
      </div>

      {currentList.length === 0 ? (
        <EmptyState
          title={activeTab === "cancelled" ? "No cancelled bookings" : "No active bookings"}
          subtitle={
            activeTab === "cancelled"
              ? "You don't have any cancelled bookings at the moment"
              : "You don't have any active bookings at the moment"
          }
        />
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          {currentList.map((item) => {
            const isExpired = !isCancelled(item) && isBookingExpired(item.endDate);
            const hasUserReviewed = isExpired && hasReviewed(item.id);
            return (
              <ListingCards
                key={item.id}
                data={item.listing}
                reservation={item}
                actionId={item.id}
                onAction={
                  activeTab === "active" && !hasUserReviewed
                    ? isExpired
                      ? () => openModal(item.id, true)
                      : () => openModal(item.id)
                    : undefined
                }
                disabled={deletingId === item.id || hasUserReviewed}
                actionLabel={
                  activeTab === "active"
                    ? hasUserReviewed
                      ? "Reviewed"
                      : isExpired
                      ? "Write Review"
                      : "Cancel Reservation"
                    : undefined
                }
                currentUser={currentUser}
                {...(activeTab === "cancelled" &&
                  isCancelled(item) && {
                    label: `Cancelled on ${new Date(item.cancelledAt).toLocaleDateString()}`,
                    labelColor: "text-rose-500",
                  })}
              />
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Confirm Cancellation</h2>
            <p className="text-gray-600 mb-4">Are you sure you want to cancel this reservation? The amount will be refunded to your wallet.</p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                onClick={closeModal}
              >
                No
              </button>
              <button
                className="px-4 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition"
                onClick={onCancel}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {reviewModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Write a Review</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                onClick={onSubmitReview}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default TripsClient;