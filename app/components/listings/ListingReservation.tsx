"use client";
import { Range } from "react-date-range";
import Calendar from "../inputs/Calendar";
import Button from "../Button";
import RenderRazorpay from "../renderRazorpay";
import { useState } from "react";
import { createOrder } from "@/services/userApi";
import toast from "react-hot-toast";

interface ListingReservationProps {
  price: number;
  offerPrice?: number | null;
  dateRange: Range;
  totalPrice: number;
  onChangeDates: (value: Range) => void;
  disabled?: boolean;
  disabledDates: Date[];
  listingId: string;
  onSubmit?: () => void; // Add onSubmit prop
}

function ListingReservation({
  price,
  offerPrice,
  dateRange,
  totalPrice,
  onChangeDates,
  disabled,
  disabledDates,
  listingId,
  onSubmit, // Destructure onSubmit
}: ListingReservationProps) {
  const [displayRazorpay, setDisplayRazorpay] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderId: null as string | null,
    currency: null as string | null,
    amount: null as number | null,
  });

  const displayPrice = offerPrice !== undefined && offerPrice !== null ? offerPrice : price;

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
            <div className="text-sm text-gray-500 line-through ml-2">₹ {price}</div>
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
            onClick={onSubmit || handleSubmit} // Use onSubmit if provided, else fallback to handleSubmit
            disabled={disabled}
            label="Reserve"
          />
        </div>
      </div>

      {displayRazorpay && orderDetails.orderId && orderDetails.currency && orderDetails.amount && (
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