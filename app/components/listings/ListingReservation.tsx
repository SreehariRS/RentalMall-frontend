"use client";
import { Range } from "react-date-range";
import Calendar from "../inputs/Calendar";
import Button from "../Button";
import RenderRazorpay from "../renderRazorpay";
import { useState, useEffect } from "react";
import { createOrder } from "@/services/userApi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeUser } from "@/app/types";

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
  currentUser?: SafeUser | null;
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
  currentUser,
}: ListingReservationProps) {
  const [displayRazorpay, setDisplayRazorpay] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderId: null as string | null,
    currency: null as string | null,
    amount: null as number | null,
  });
  const [isPaymentLocked, setIsPaymentLocked] = useState(false);
  const router = useRouter();
  const loginModal = useLoginModal();

  const displayPrice =
    offerPrice !== undefined && offerPrice !== null ? offerPrice : price;

  useEffect(() => {
    if (currentUser?.id) {
      const lockKey = `paymentLock_${currentUser.id}`;
      const lock = localStorage.getItem(lockKey);
      
      if (lock) {
        try {
          const lockData = JSON.parse(lock);
          const lockTime = new Date(lockData.timestamp).getTime();
          const currentTime = new Date().getTime();
          
        
          if (currentTime - lockTime > 10 * 60 * 1000) {
            localStorage.removeItem(lockKey);
            setIsPaymentLocked(false);
          } else {
            setIsPaymentLocked(true);
          }
        } catch (error) {
          console.error("Error parsing lock data:", error);
          localStorage.removeItem(lockKey);
          setIsPaymentLocked(false);
        }
      } else {
        setIsPaymentLocked(false);
      }
    }
  }, [currentUser?.id]);


  const setPaymentLock = (locked: boolean) => {
    if (currentUser?.id) {
      const lockKey = `paymentLock_${currentUser.id}`;
      
      if (locked) {
        const lockData = {
          locked: true,
          timestamp: new Date().toISOString(),
          listingId: listingId
        };
        localStorage.setItem(lockKey, JSON.stringify(lockData));
        setIsPaymentLocked(true);
      } else {
        localStorage.removeItem(lockKey);
        setIsPaymentLocked(false);
      }
      

      window.dispatchEvent(new StorageEvent('storage', {
        key: lockKey,
        newValue: locked ? JSON.stringify({
          locked: true,
          timestamp: new Date().toISOString(),
          listingId: listingId
        }) : null,
        storageArea: localStorage
      }));
    }
  };


  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (currentUser?.id && e.key === `paymentLock_${currentUser.id}`) {
        if (e.newValue) {
          try {
            const lockData = JSON.parse(e.newValue);
            const lockTime = new Date(lockData.timestamp).getTime();
            const currentTime = new Date().getTime();
            
        
            if (currentTime - lockTime > 10 * 60 * 1000) {
              localStorage.removeItem(e.key!);
              setIsPaymentLocked(false);
            } else {
              setIsPaymentLocked(true);
            }
          } catch (error) {
            console.error("Error parsing lock data from storage:", error);
            localStorage.removeItem(e.key!);
            setIsPaymentLocked(false);
          }
        } else {
          setIsPaymentLocked(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser?.id]);

  const handleReserveClick = async () => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    
    if (isPaymentLocked && !displayRazorpay) {
  
      const lockKey = `paymentLock_${currentUser.id}`;
      const lock = localStorage.getItem(lockKey);
      
      if (lock) {
        try {
          const lockData = JSON.parse(lock);
          if (lockData.listingId === listingId) {
            toast.error("You have a payment in progress for this property. Please complete it first.");
            return;
          }
       
        } catch (error) {
          console.error("Error parsing lock data:", error);
          localStorage.removeItem(lockKey);
        }
      }
    }

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
        
    
        setPaymentLock(true);
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
    setPaymentLock(false); 
    window.location.href = "/trips";
  };

  const handleFailure = () => {
    console.log("Payment failed!");
    setDisplayRazorpay(false);
    setPaymentLock(false);
    toast.error("Payment failed. Please try again.");
  };


  const handleModalDismiss = () => {
    console.log("Razorpay modal closed by user");
    setDisplayRazorpay(false);
    setPaymentLock(false); 
    toast("Payment cancelled");
  };


  const isCurrentListingLocked = () => {
    if (!currentUser?.id || !isPaymentLocked) return false;
    
    const lockKey = `paymentLock_${currentUser.id}`;
    const lock = localStorage.getItem(lockKey);
    
    if (lock) {
      try {
        const lockData = JSON.parse(lock);
        return lockData.listingId === listingId;
      } catch (error) {
        console.error("Error parsing lock data:", error);
        return false;
      }
    }
    return false;
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
            onClick={handleReserveClick}
            disabled={disabled || (isPaymentLocked && isCurrentListingLocked() && !displayRazorpay)}
            label={isPaymentLocked && isCurrentListingLocked() && !displayRazorpay ? "Payment in Progress..." : "Reserve"}
          />
          
         
          {isPaymentLocked && isCurrentListingLocked() && !displayRazorpay && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800 font-medium">
                Payment in Progress
              </div>
              <div className="text-sm text-yellow-600 mt-1">
                You have a payment in progress for this property. 
                Please complete that payment first.
              </div>
            </div>
          )}
        </div>
      </div>

      {displayRazorpay &&
        orderDetails.orderId &&
        orderDetails.currency &&
        orderDetails.amount && (
          <RenderRazorpay
            orderId={orderDetails.orderId || ""}
            keyId="rzp_test_rJ0yPg6ZIlUOvq"
            currency={orderDetails.currency || "INR"}
            amount={orderDetails.amount || 0}
            listingId={listingId}
            startDate={dateRange.startDate?.toISOString() || ""}
            endDate={dateRange.endDate?.toISOString() || ""}
            totalPrice={totalPrice}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
            onDismiss={handleModalDismiss} 
          />
        )}
    </>
  );
}

export default ListingReservation;