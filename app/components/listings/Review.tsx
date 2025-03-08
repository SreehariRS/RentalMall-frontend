"use client";
import React, { useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Avatar from "../Avatar";
interface ReviewProps {
    reviews: {
        id: string;
        author: string;
        date: string;
        rating: number;
        title: string;
        content: string;
        helpfulCount: number;
        verified: boolean;
        userId: string; // Added for ownership check
    }[];
    currentUser?: { id: string; name?: string | null } | null; // Added to check if user is the author
    onReviewChange?: () => void; // Callback to refresh reviews in parent component
}

function Review({ reviews, currentUser, onReviewChange }: ReviewProps) {
    const [selectedRating, setSelectedRating] = useState(0);
    const [sortOption, setSortOption] = useState<"newest" | "highest" | "lowest" | "helpful">("newest");
    const [visibleReviews, setVisibleReviews] = useState(6);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedReview, setSelectedReview] = useState<{
        id: string;
        rating: number;
        title: string;
        content: string;
    } | null>(null);

    const averageRating =
        reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0;

    const ratingCounts = reviews.reduce<{ [key: number]: number }>((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
    }, {});

    const filteredReviews = selectedRating > 0 ? reviews.filter((review) => review.rating === selectedRating) : reviews;

    const sortedReviews = [...filteredReviews].sort((a, b) => {
        if (sortOption === "newest") {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortOption === "highest") {
            return b.rating - a.rating;
        } else if (sortOption === "lowest") {
            return a.rating - b.rating;
        } else if (sortOption === "helpful") {
            return b.helpfulCount - a.helpfulCount;
        }
        return 0;
    });

    const renderStars = (rating: number) => {
        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-xl ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const showAllReviews = () => {
        setVisibleReviews(reviews.length);
    };

    const openEditModal = (review: { id: string; rating: number; title: string; content: string }) => {
        setSelectedReview(review);
        setEditModalVisible(true);
    };

    const openDeleteModal = (reviewId: string) => {
        setSelectedReview(reviews.find((r) => r.id === reviewId) || null);
        setDeleteModalVisible(true);
    };

    const closeModal = useCallback(() => {
        setEditModalVisible(false);
        setDeleteModalVisible(false);
        setSelectedReview(null);
    }, []);

    const handleEditReview = useCallback(() => {
        if (!selectedReview || !currentUser) return;

        axios
            .put("/api/reviews", {
                reviewId: selectedReview.id,
                rating: selectedReview.rating,
                title: selectedReview.title,
                content: selectedReview.content,
            })
            .then(() => {
                toast.success("Review updated!");
                onReviewChange?.();
                closeModal();
            })
            .catch((error) => {
                toast.error(error?.response?.data?.error || "Failed to update review");
            });
    }, [selectedReview, currentUser, onReviewChange, closeModal]);

    const handleDeleteReview = useCallback(() => {
        if (!selectedReview || !currentUser) return;

        axios
            .delete(`/api/reviews?reviewId=${selectedReview.id}`)
            .then(() => {
                toast.success("Review deleted!");
                onReviewChange?.();
                closeModal();
            })
            .catch((error) => {
                toast.error(error?.response?.data?.error || "Failed to delete review");
            });
    }, [selectedReview, currentUser, onReviewChange, closeModal]);

    const remainingReviews = reviews.length - visibleReviews;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-lg">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Customer Reviews</h1>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        <div className="text-6xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                        <div className="my-3">{renderStars(Math.round(averageRating))}</div>
                        <div className="text-sm text-gray-600">{reviews.length} customer ratings</div>
                    </div>

                    <div className="w-full md:w-1/2">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center mb-3">
                                <button
                                    onClick={() => setSelectedRating(selectedRating === star ? 0 : star)}
                                    className={`flex items-center hover:underline ${
                                        selectedRating === star ? "font-bold text-blue-600" : "text-gray-700"
                                    }`}
                                >
                                    <span className="mr-2">{star}</span>
                                    <span className="text-yellow-500">★</span>
                                </button>
                                <div className="mx-4 flex-1">
                                    <div className="bg-gray-200 h-2 rounded-full">
                                        <div
                                            className="bg-yellow-500 h-2 rounded-full"
                                            style={{
                                                width: `${
                                                    ratingCounts[star] ? (ratingCounts[star] / reviews.length) * 100 : 0
                                                }%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">{ratingCounts[star] || 0}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        {selectedRating > 0 ? `${selectedRating}-Star Reviews` : "All Reviews"}
                    </h2>
                </div>
                <div className="flex items-center">
                    <label htmlFor="sort-select" className="mr-2 text-sm text-gray-600">
                        Sort by:
                    </label>
                    <select
                        id="sort-select"
                        className="border rounded-lg p-2 text-sm bg-white shadow-sm"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as "newest" | "highest" | "lowest" | "helpful")}
                    >
                        <option value="newest">Newest</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                        <option value="helpful">Most Helpful</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sortedReviews.slice(0, visibleReviews).map((review) => (
                    <div
                        key={review.id}
                        className="bg-white p-0 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                    >
                        {/* Review Header */}
                        <div className="bg-gray-50 p-4 border-b border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center space-x-2">
                                    <Avatar src={null} size={32} className="border-2 border-white" />
                                    <span className="font-medium text-gray-800">{review.author}</span>
                                    {review.verified && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                            ✓ Verified
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Date(review.date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex">{renderStars(review.rating)}</div>
                            </div>
                        </div>

                        {/* Review Content */}
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{review.title}</h3>

                            {/* Scrollable review content */}
                            <div
                                className="text-gray-700 text-sm leading-relaxed max-h-12 overflow-y-auto pr-2 custom-scrollbar mb-4"
                                style={{
                                    scrollbarWidth: "thin",
                                    scrollbarColor: "#CBD5E0 #EDF2F7",
                                }}
                            >
                                {review.content}
                            </div>

                            {/* Footer with helpful button and edit/delete controls */}
                            <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-100">
                                {currentUser?.id === review.userId && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                openEditModal({
                                                    id: review.id,
                                                    rating: review.rating,
                                                    title: review.title,
                                                    content: review.content,
                                                })
                                            }
                                            className="text-xs text-gray-600 hover:text-green-600 transition-colors flex items-center space-x-1"
                                            aria-label="Edit review"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(review.id)}
                                            className="text-xs text-gray-600 hover:text-red-600 transition-colors flex items-center space-x-1"
                                            aria-label="Delete review"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {remainingReviews > 0 && (
                <div className="mt-10 text-center">
                    <button
                        onClick={showAllReviews}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                        Show All Remaining Reviews ({remainingReviews})
                    </button>
                </div>
            )}

            {/* Edit Review Modal */}
            {editModalVisible && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Edit Review</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Rating</label>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setSelectedReview({ ...selectedReview, rating: star })}
                                        className={`text-2xl ${
                                            star <= selectedReview.rating ? "text-yellow-500" : "text-gray-300"
                                        }`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                value={selectedReview.title}
                                onChange={(e) => setSelectedReview({ ...selectedReview, title: e.target.value })}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Content</label>
                            <textarea
                                value={selectedReview.content}
                                onChange={(e) => setSelectedReview({ ...selectedReview, content: e.target.value })}
                                className="w-full p-2 border rounded-md"
                                rows={4}
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                                onClick={handleEditReview}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Review Modal */}
            {deleteModalVisible && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Delete Review</h2>
                        <p className="text-gray-600 mb-4">Are you sure you want to delete this review?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                                onClick={closeModal}
                            >
                                No
                            </button>
                            <button
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                                onClick={handleDeleteReview}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Review;
