"use client";
import { Range } from "react-date-range";
import Calendar from "../inputs/Calendar";
import Button from "../Button";
import RenderRazorpay from "../renderRazorpay";
import { useState } from "react";
import { createOrder } from "@/services/userApi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useLoginModal from "@/app/hooks/useLoginModal"; // Import the login modal hook
import { SafeUser } from "@/app/types"; // Import SafeUser type for currentUser

interface ListingReservationProps {
  price: number;
  offerPrice?: number | null;
  dateRange: Range;
  totalPrice: number;
  onChangeDates: (value: Range) => void;
  onSubmit: () => void;
  disabled?: boolean;
  disabledDates: Date[];
  listingId: string;
  currentUser?: SafeUser | null; // Add currentUser prop to check if user is logged in
}

function ListingReservation({
  price,
  offerPrice,
  dateRange,
  totalPrice,
  onChangeDates,
  onSubmit,
  disabled,
  disabledDates,
  listingId,
  currentUser, // Destructure the new prop
}: ListingReservationProps) {
  const [displayRazorpay, setDisplayRazorpay] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderId: null as string | null,
    currency: null as string | null,
    amount: null as number | null,
  });
  const router = useRouter();
  const loginModal = useLoginModal(); // Initialize the login modal hook

  const displayPrice =
    offerPrice !== undefined && offerPrice !== null ? offerPrice : price;

  // Handle the Reserve button click
  const handleReserveClick = async () => {
    if (!currentUser) {
      // If user is not logged in, trigger the login modal
      return loginModal.onOpen();
    }

    // If user is logged in, proceed with the existing handleSubmit logic
    await handleSubmit();
  };

  async function handleSubmit() {
    try {
      const data = await createOrder(totalPrice, "INR");
      if (data && data.order_id && data.currency && data.amount) {
        setOrderDetails({
          orderId: data.order_id,
          currency: data.currency,
          amount: data.amount,
        });
        setDisplayRazorpay(true);
      } else {
        toast.error("Failed to create payment order");
      }
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("An error occurred while initiating payment");
    }
  }

  const handleSuccess = () => {
    console.log("Payment successful!");
    setDisplayRazorpay(false);
    // Use window.location.href for a full page refresh on redirection
    window.location.href = "/trips";
  };

  const handleFailure = () => {
    console.log("Payment failed!");
    toast.error("Payment failed. Please try again.");
  };

  return (
    <>
      <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden">
        <div className="flex flex-row items-center gap-1 p-4">
          <div className="text-2xl font-semibold">₹ {displayPrice}</div>
          <div className="font-light text-neutral-600">night</div>
          {offerPrice !== undefined && offerPrice !== null && (
            <div className="text-sm text-gray-500 line-through ml-2">
              ₹ {price}
            </div>
          )}
        </div>
        <hr />
        <Calendar
          value={dateRange}
          disabledDates={disabledDates}
          onChange={(value) => onChangeDates(value.selection)}
        />
        <hr />
        <div className="p-4 flex flex-row items-center justify-between font-semibold text-lg">
          <div>Total</div>
          <div>₹ {totalPrice}</div>
        </div>
        <div className="p-4">
          <Button
            onClick={handleReserveClick} // Use the new handler instead of handleSubmit
            disabled={disabled}
            label="Reserve"
          />
        </div>
      </div>

      {displayRazorpay &&
        orderDetails.orderId &&
        orderDetails.currency &&
        orderDetails.amount && (
          <RenderRazorpay
            orderId={orderDetails.orderId || ""}
            keyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!}
            currency={orderDetails.currency || "INR"}
            amount={orderDetails.amount || 0}
            listingId={listingId}
            startDate={dateRange.startDate?.toISOString() || ""}
            endDate={dateRange.endDate?.toISOString() || ""}
            totalPrice={totalPrice}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
          />
        )}
    </>
  );
}

export default ListingReservation;