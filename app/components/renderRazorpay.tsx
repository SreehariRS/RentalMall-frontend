"use client";
import { useEffect, useRef } from "react";
import Axios from "axios";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadScript = (src: string) =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      console.log("Razorpay loaded successfully");
      resolve(true);
    };
    script.onerror = () => {
      console.log("Error in loading Razorpay");
      resolve(false);
    };
    document.body.appendChild(script);
  });

interface RenderRazorpayProps {
  orderId: string;
  keyId: string;
  currency: string;
  amount: number;
  listingId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  onSuccess: () => void;
  onFailure: () => void;
}

const RenderRazorpay = ({
  orderId,
  keyId,
  currency,
  amount,
  listingId,
  startDate,
  endDate,
  totalPrice,
  onSuccess,
  onFailure,
}: RenderRazorpayProps) => {
  const paymentId = useRef<string | null>(null);
  const paymentMethod = useRef<string | null>(null);
  const razorpayInstance = useRef<any>(null);

  const handlePayment = async (status: string, response?: any) => {
    try {
      if (status === "success") {
        const result = await Axios.post("/api/reservations", {
          listingId,
          startDate,
          endDate,
          totalPrice,
          orderId,
          paymentId: paymentId.current,
          status: "success",
        });

        if (result.data.success) {
          console.log("Reservation created successfully:", result.data);
          if (razorpayInstance.current) {
            razorpayInstance.current.close(); // Attempt to close cleanly
          }
          onSuccess(); // Trigger redirect and reload in ListingReservation
        } else {
          console.error("Reservation creation failed:", result.data.error);
          onFailure();
        }
      } else {
        console.log(`Payment ${status}`);
        if (razorpayInstance.current) {
          razorpayInstance.current.close();
        }
        onFailure();
      }
    } catch (error) {
      console.error("Error handling payment:", error);
      if (razorpayInstance.current) {
        razorpayInstance.current.close();
      }
      onFailure();
    }
  };

  const displayRazorpay = async (options: any) => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      console.log("Razorpay SDK failed to load. Are you online?");
      return;
    }
    if (!window.Razorpay) {
      console.error("Razorpay is not available on window");
      return;
    }

    razorpayInstance.current = new window.Razorpay(options);

    razorpayInstance.current.on("payment.submit", (response: any) => {
      paymentMethod.current = response.method;
    });

    razorpayInstance.current.on("payment.failed", (response: any) => {
      paymentId.current = response.error.metadata.payment_id;
      console.log("Payment failed:", response.error);
      handlePayment("failed");
    });

    razorpayInstance.current.open();
  };

  const options = {
    key: keyId,
    amount: amount.toString(),
    currency,
    name: "RentalMall",
    order_id: orderId,
    handler: (response: any) => {
      console.log("Payment succeeded:", response);
      paymentId.current = response.razorpay_payment_id;
      handlePayment("success", response);
    },
    modal: {
      confirm_close: true,
      ondismiss: async (reason: any) => {
        if (reason === undefined) {
          console.log("Payment cancelled");
          handlePayment("cancelled");
        } else if (reason === "timeout") {
          console.log("Payment timed out");
          handlePayment("timedout");
        } else {
          console.log("Payment failed:", reason);
          handlePayment("failed", reason);
        }
      },
    },
    retry: { enabled: false },
    timeout: 900,
    theme: { color: "#F37254" },
  };

  useEffect(() => {
    console.log("Initializing Razorpay");
    displayRazorpay(options);

    return () => {
      if (razorpayInstance.current) {
        console.log("Cleaning up Razorpay instance");
        razorpayInstance.current.close();
      }
    };
  }, []);

  return null;
};

export default RenderRazorpay;