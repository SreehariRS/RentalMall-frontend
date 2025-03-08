"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, Home, Search, User, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllReservations } from "../../../services/adminApi";
import Sidebar from "../../components/Sidebar";
import Loader from "@/app/components/Loader";

interface Reservation {
    id: string;
    guestName: string;
    startDate: string;
    endDate: string;
    hostName: string;
    propertyName: string;
}

interface PaginatedReservationResponse {
    data: Reservation[];
    error?: boolean;
    message?: string;
    totalPages?: number;
}

interface ErrorResponse {
    error: true;
    message: string;
}

function isPaginatedReservationResponse(
    response: PaginatedReservationResponse | ErrorResponse
): response is PaginatedReservationResponse {
    return (response as PaginatedReservationResponse).data !== undefined;
}

const ReservationList = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchReservations(currentPage);
    }, [currentPage]);

    const fetchReservations = async (page: number) => {
        setLoading(true);
        const response: PaginatedReservationResponse | ErrorResponse = await getAllReservations(page, 10);

        if (isPaginatedReservationResponse(response)) {
            setReservations(response.data);
            setTotalPages(response.totalPages || 1);
        } else {
            setError(response.message || "Failed to fetch reservations.");
        }
        setLoading(false);
    };

    const formatDate = (dateStr: string | number | Date) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const filteredReservations = reservations.filter(
        (reservation) =>
            reservation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reservation.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reservation.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
            {/* Sidebar remains visible always */}
            <div className="w-64 bg-gray-800">
                <Sidebar />
            </div>

            {/* Main content area */}
            <main className="flex-1 p-6">
                <div className="w-full max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-lg">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-2xl font-bold mb-4 text-white">Reservations</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search reservations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full max-w-sm pl-10 pr-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Show loading only in the table section */}
                        {loading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader />
                            </div>
                        ) : error ? (
                            <div className="text-red-500 py-6 text-center">Error: {error}</div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto text-gray-300">
                                        <thead className="bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Guest</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Dates</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Host</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Property</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-600">
                                            {filteredReservations.map((reservation) => (
                                                <tr key={reservation.id} className="hover:bg-gray-700">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            {reservation.guestName}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <CalendarDays className="h-4 w-4 text-gray-400" />
                                                            {formatDate(reservation.startDate)} -{" "}
                                                            {formatDate(reservation.endDate)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            {reservation.hostName}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Home className="h-4 w-4 text-gray-400" />
                                                            {reservation.propertyName}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <button
                                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-400">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReservationList;
