import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default function NotFound() {
  console.log("Custom _not-found page rendered");
  notFound();
}