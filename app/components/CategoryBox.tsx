'use client';
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback } from "react";
import { IconType } from "react-icons";
import qs from "query-string";

interface CategoryBoxProps {
    icon: IconType;
    label: string;
    selected?: boolean;
}

// Define a type for the query parameters
interface QueryParams {
    category?: string;
    [key: string]: string | undefined;
}

function CategoryBox({ icon: Icon, label, selected }: CategoryBoxProps) {
    const router = useRouter();
    const params = useSearchParams();

    const handleClick = useCallback(() => {
        let currentQuery: QueryParams = {};

        // Parse current query parameters
        if (params) {
            currentQuery = qs.parse(params.toString()) as QueryParams;
        }

        // Update query with the category
        const updatedQuery: QueryParams = {
            ...currentQuery,
            category: label,
        };

        // If the category is already selected, remove it
        if (params?.get("category") === label) {
            delete updatedQuery.category;
        }

        // Combine the updated query into a full URL
        const url = qs.stringifyUrl(
            {
                url: "/",
                query: updatedQuery,
            },
            { skipNull: true }
        );

        // Navigate to the new URL
        router.push(url);
    }, [label, params, router]);

    return (
        <div
            onClick={handleClick}
            className={`flex flex-col items-center justify-center gap-2 
                hover:text-neutral-800 transition cursor-pointer
                border-b-2 
                ${selected ? "border-neutral-800 text-neutral-800" : "border-transparent text-neutral-500"}
            `}
        >
            <Icon size={26} />
            <div className="font-medium text-sm">{label}</div>
        </div>
    );
}

export default CategoryBox;