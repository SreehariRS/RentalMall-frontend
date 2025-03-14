"use client";
import { useRouter } from "next/navigation";
import Container from "../components/Container";
import Heading from "../components/Heading";
import { safelisting, SafeUser } from "../types";
import { useCallback, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ListingCards from "../components/listings/ListingCards";

interface PropertiesClientProps {
  listings: safelisting[];
  currentUser?: SafeUser | null;
}

function PropertiesClient({ listings = [], currentUser }: PropertiesClientProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [activeReservation, setActiveReservation] = useState<{ startDate: string; endDate: string } | null>(null);
  const [offerPrice, setOfferPrice] = useState<number | "">("");
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);

  // Debug: Log the listings prop to verify its value
  console.log("PropertiesClient listings prop:", listings);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Delete modal
  const openModal = async (id: string) => {
    try {
      const response = await axios.get(`/api/listings/${id}/reservations`);
      const activeReservations = response.data;

      if (activeReservations && activeReservations.length > 0) {
        const reservation = activeReservations[0];
        const formattedStartDate = formatDate(reservation.startDate);
        const formattedEndDate = formatDate(reservation.endDate);

        setActiveReservation({
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        });
      } else {
        setActiveReservation(null);
      }

      setSelectedListingId(id);
      setModalVisible(true);
    } catch (error) {
      console.error("Error checking reservations:", error);
      toast.error("Error checking property reservations");
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedListingId(null);
    setActiveReservation(null);
  };

  // Offer modal
  const openOfferModal = (id: string, price: number) => {
    setSelectedListingId(id);
    setOriginalPrice(price);
    setOfferPrice("");
    setOfferModalVisible(true);
  };

  const closeOfferModal = () => {
    setOfferModalVisible(false);
    setSelectedListingId(null);
    setOriginalPrice(null);
  };

  const onCancel = useCallback(() => {
    if (!selectedListingId) return;

    setDeletingId(selectedListingId);
    axios
      .delete(`/api/listings/${selectedListingId}`)
      .then(() => {
        toast.success("Listing deleted");
        router.refresh();
      })
      .catch((error) => {
        console.error("Cancellation error:", error.response?.data || error.message);
        toast.error(error?.response?.data?.error || "An error occurred");
      })
      .finally(() => {
        setDeletingId("");
        closeModal();
      });
  }, [router, selectedListingId]);

  const onSubmitOffer = useCallback(() => {
    if (!selectedListingId || offerPrice === "" || originalPrice === null) return;

    const offerPriceNum = Number(offerPrice);

    if (offerPriceNum >= originalPrice) {
      toast.error("Offer price must be less than the original price (₹" + originalPrice + ")");
      return;
    }

    setDeletingId(selectedListingId);
    axios
      .put(`/api/listings/${selectedListingId}/offer`, { offerPrice: offerPriceNum })
      .then(() => {
        toast.success("Offer price updated");
        router.refresh();
      })
      .catch((error) => {
        console.error("Offer error:", error.response?.data || error.message);
        toast.error(error?.response?.data?.error || "Failed to set offer price");
      })
      .finally(() => {
        setDeletingId("");
        closeOfferModal();
      });
  }, [router, selectedListingId, offerPrice, originalPrice]);

  const onRemoveOffer = useCallback(() => {
    if (!selectedListingId) return;

    setDeletingId(selectedListingId);
    axios
      .put(`/api/listings/${selectedListingId}/offer`, { offerPrice: null })
      .then(() => {
        toast.success("Offer removed");
        router.refresh();
      })
      .catch((error) => {
        console.error("Remove offer error:", error.response?.data || error.message);
        toast.error(error?.response?.data?.error || "Failed to remove offer");
      })
      .finally(() => {
        setDeletingId("");
        closeOfferModal();
      });
  }, [router, selectedListingId]);

  // Add defensive check to ensure listings is an array before calling find
  const selectedListing = Array.isArray(listings)
    ? listings.find((listing) => listing.id === selectedListingId)
    : null;

  return (
    <Container>
      <Heading title="Properties" subtitle="List of Your Rental Properties" />
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
        {Array.isArray(listings) && listings.length > 0 ? (
          listings.map((listing) => (
            <ListingCards
              key={listing.id}
              data={listing}
              actionId={listing.id}
              onAction={() => openModal(listing.id)}
              onOffer={(id, price) => openOfferModal(id, price)}
              disabled={deletingId === listing.id}
              actionLabel="Delete Properties"
              currentUser={currentUser}
            />
          ))
        ) : (
          <p>No properties found.</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-4">
              {activeReservation
                ? `This property has an active reservation from ${activeReservation.startDate} to ${activeReservation.endDate}. Are you sure you want to proceed with deletion?`
                : "Are you sure you want to delete this Property?"}
            </p>
            <div className="flex justify-end space-x-3">
              <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md" onClick={closeModal}>
                No
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-md" onClick={onCancel}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {offerModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Set Offer Price</h2>
            <p className="text-gray-600 mb-2">Original Price: ₹{originalPrice}</p>
            <input
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Enter offer price"
              className="w-full p-2 border rounded-md mb-4"
              min="0"
            />
            <div className="flex justify-end space-x-3">
              <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md" onClick={closeOfferModal}>
                Cancel
              </button>
              {/* Conditionally render Remove Offer button only if offerPrice exists */}
              {selectedListing?.offerPrice && (
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-md"
                  onClick={onRemoveOffer}
                >
                  Remove Offer
                </button>
              )}
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                onClick={onSubmitOffer}
                disabled={offerPrice === "" || offerPrice <= 0}
              >
                Set Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default PropertiesClient;