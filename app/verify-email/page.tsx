// app/verify-email/page.tsx
import React, { Suspense } from "react";
import VerifyEmailForm from "../components/verify-email-form";

// Add this line to make the page dynamic
export const dynamic = "force-dynamic";

function VerifyEmailPage() {
  return (
    <div>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}

export default VerifyEmailPage;