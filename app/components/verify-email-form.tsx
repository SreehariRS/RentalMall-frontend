// app/components/verify-email-form.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CardWrapper from "./auth/card-wrapper";
import { FormSuccess } from "./auth/form-sucess";
import { FormError } from "./auth/form-error";

const VerifyEmailForm = () => {
  const [loading, setLoading] = useState(true); // Track loading state explicitly
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("No token provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(data.success || "Your email has been verified successfully.");
        } else {
          setError(data.error || "Failed to verify email.");
        }
      } catch (error) {
        console.error("Verification failed:", error);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false); 
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <CardWrapper
      headerLabel="Confirming your email address"
      title="Confirming now..."
      backButtonHref="/"
      backButtonLabel="Back to login"
    >
      <div className="flex items-center w-full justify-center">
        {loading && <p>Loading...</p>}
        {!loading && success && <FormSuccess message={success} />}
        {!loading && error && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};

export default VerifyEmailForm;