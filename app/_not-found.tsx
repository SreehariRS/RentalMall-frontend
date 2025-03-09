// app/_not-found.tsx
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default function NotFound() {
  notFound();
}