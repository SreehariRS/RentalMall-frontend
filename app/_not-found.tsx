// app/_not-found.tsx
"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function NotFoundContent() {
  const searchParams = useSearchParams();
  return <div>Not Found - {searchParams?.get("from") ?? "Unknown source"}</div>;
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}