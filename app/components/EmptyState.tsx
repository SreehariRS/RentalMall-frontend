"use client"

import { useRouter } from "next/navigation";
import Heading from "./Heading";
import Button from "./Button";

interface EmptyStateProps {
    title?: string;
    subtitle?: string;
    showReset?: boolean;
}

function EmptyState({
    title = "No exact matches",
    subtitle = "Try catching or removing some of your filters",
    showReset
}: EmptyStateProps) {
    const router = useRouter()
    return (
        <div className="h-[60vh] flex flex-col gap-2 justify-center items-center">
          <Heading
            center
            title={title}
            subtitle={subtitle}
          />
          <p 
            className="text-neutral-500 hover:text-neutral-800 cursor-pointer mt-2"
            onClick={() => router.push('/')}
          >
            Go to homepage
          </p>
          <div className="w-48 mt-4">
            {showReset && (
                <Button
                    outline
                    label="Remove all Filters"
                    onClick={() => router.push('/')}
                />
            )}
          </div>
        </div>
    );
}

export default EmptyState;