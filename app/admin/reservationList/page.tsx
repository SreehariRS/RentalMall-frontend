"use client";

import React, { useEffect, useState } from "react";
import { 
  CalendarDays, 
  Home, 
  Search, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  ClipboardList, 
  Check, 
  AlertCircle 
} from "lucide-react";
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
    const [filterOpen, setFilterOpen] = useState(false);

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
        <div className="flex min-h-screen bg-gray-950 text-gray-200">
            {/* Sidebar */}
            <div className="w-72 bg-gray-900 shadow-2xl border-r border-gray-800/50">
                <Sidebar />
            </div>

            {/* Main content area */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-1">
                            Reservations
                            <span className="ml-2 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Manager</span>
                        </h1>
                        <p className="text-gray-400">View and manage all booking information</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-900 p-3 rounded-xl border border-gray-800/50">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="text-gray-300 font-medium">Admin Portal</div>
                    </div>
                </header>

                <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-800/50">
                    <div className="p-6 border-b border-gray-800/50 flex flex-wrap justify-between items-center gap-4">
                        <div className="relative flex-grow max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by guest, host or property..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="flex items-center px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors text-gray-300 border border-gray-700"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </button>
                            <button className="flex items-center px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors text-white">
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Export
                            </button>
                        </div>
                    </div>

                    {filterOpen && (
                        <div className="p-6 bg-gray-800/50 border-b border-gray-800/50 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Date Range</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <CalendarDays className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <input 
                                        type="date" 
                                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Property Type</label>
                                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                                    <option value="">All Types</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">House</option>
                                    <option value="villa">Villa</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                                <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                                    <option value="">All Statuses</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader />
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                                <div className="text-red-400 font-medium">Error: {error}</div>
                                <button 
                                    onClick={() => fetchReservations(currentPage)}
                                    className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : filteredReservations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Search className="h-12 w-12 text-gray-500 mb-4" />
                                <div className="text-xl font-medium mb-2">No reservations found</div>
                                <p>Try adjusting your search criteria</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr className="text-left border-b border-gray-800">
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">GUEST</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">DATES</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">HOST</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">PROPERTY</th>
                                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {filteredReservations.map((reservation, index) => {
                                                // Just for demo - random statuses
                                                const statuses = ["upcoming", "ongoing", "completed", "cancelled"];
                                                const randomStatus = statuses[index % statuses.length];
                                                
                                                return (
                                                    <tr 
                                                        key={reservation.id} 
                                                        className="hover:bg-gray-800/50 transition-colors group"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                                                    {reservation.guestName.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-white">{reservation.guestName}</div>
                                                                    <div className="text-sm text-gray-400">Guest ID: {reservation.id.substring(0, 8)}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2 text-white">
                                                                    <CalendarDays className="h-4 w-4 text-purple-400" />
                                                                    {formatDate(reservation.startDate)}
                                                                </div>
                                                                <div className="text-sm text-gray-400 mt-1">
                                                                    to {formatDate(reservation.endDate)}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                                                    {reservation.hostName.charAt(0)}
                                                                </div>
                                                                <div className="font-medium text-white">{reservation.hostName}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Home className="h-4 w-4 text-cyan-400" />
                                                                <div className="font-medium text-white">{reservation.propertyName}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`
                                                                inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                                                ${randomStatus === 'upcoming' ? 'bg-blue-500/20 text-blue-400' : ''}
                                                                ${randomStatus === 'ongoing' ? 'bg-amber-500/20 text-amber-400' : ''}
                                                                ${randomStatus === 'completed' ? 'bg-green-500/20 text-green-400' : ''}
                                                                ${randomStatus === 'cancelled' ? 'bg-red-500/20 text-red-400' : ''}
                                                            `}>
                                                                {randomStatus === 'completed' && <Check className="h-3 w-3 mr-1" />}
                                                                {randomStatus === 'cancelled' && <AlertCircle className="h-3 w-3 mr-1" />}
                                                                {randomStatus.charAt(0).toUpperCase() + randomStatus.slice(1)}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <button
                                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Previous
                                    </button>
                                    
                                    <div className="flex space-x-1">
                                        {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                            const pageNumber = i + 1;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(pageNumber)}
                                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors
                                                        ${currentPage === pageNumber 
                                                            ? 'bg-purple-600 text-white' 
                                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        })}
                                        {totalPages > 5 && (
                                            <button className="w-10 h-10 rounded-lg text-sm font-medium bg-gray-800 text-gray-400">
                                                ...
                                            </button>
                                        )}
                                    </div>
                                    
                                    <button
                                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
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