import axios from "axios";

// Base API URL
const BASE_URL = "https://api.rentalmall.site"
// Enable cookies (if needed for session handling)
axios.defaults.withCredentials = true;

// Add a listing to favorites
export const addFavorite = async (listingId: string) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/api/favorites/add`,
            { listingId },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Error adding to favorites:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || "Failed to add to favorites.";
        return { error: true, message: errorMessage };
    }
};

// Remove a listing from favorites
export const removeFavorite = async (listingId: string) => {
    try {
        const response = await axios.delete(`${BASE_URL}/api/favorites/remove`, {
            data: { listingId },
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error: any) {
        console.error("Error removing from favorites:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || "Failed to remove from favorites.";
        return { error: true, message: errorMessage };
    }
};

// Fetch favorite listings
export const getFavoriteListings = async () => {
    try {
        console.log("BASE_URL:", BASE_URL);
        const response = await axios.get(`${BASE_URL}/api/favorites`);
        console.log("API Response:", response.data); // Debug the API response
        return response.data.listings || [];
    } catch (error: any) {
        console.log(error);
    }
};

// Fetch user profile
export const getProfile = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/get-profile`, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data.data;
    } catch (error: any) {
        console.error("Error fetching user profile:", error);
        return { error: true, message: "Failed to fetch user profile." };
    }
};

// Change password

export const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/api/change-password`,
            { currentPassword, newPassword },
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error changing password:", error.response?.data);
            return {
                error: true,
                message: error.response?.data?.error || "Failed to change password.",
            };
        }
        console.error("Error changing password:", error);
        return {
            error: true,
            message: "An error occurred while changing password.",
        };
    }
};

export const getListingById = async (listingId: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/listings/${listingId}`);
        return response.data;
    } catch (error: any) {
        console.error("Error fetching listing:", error.response?.data || error.message);
        return { error: true, message: "Failed to fetch listing details." };
    }
};
export const getListingsByCategory = async (category: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/listings`, {
            params: { category },
        });
        return response.data;
    } catch (error: any) {
        console.error("Error fetching listings:", error.response?.data || error.message);
        return { error: true, message: "Failed to fetch listings." };
    }
};

export const createListing = async (listingData: any) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/listings`, listingData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error: any) {
        console.error("Error creating listing:", error.response?.data || error.message);
        return {
            error: true,
            message: error.response?.data?.error || "Failed to create listing.",
        };
    }
};
export const createMessage = async (messageData: any) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/messages`, messageData, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error: any) {
        console.error("Error creating message:", error.response?.data || error.message);
        return { error: true, message: "Failed to send message." };
    }
};
export const markMessageAsSeen = async (conversationId: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/messages/seen/${conversationId}`);
        return response.data;
    } catch (error: any) {
        console.error("Error marking message as seen:", error.response?.data || error.message);
        return { error: true, message: "Failed to mark message as seen." };
    }
}

export const updateProfileImage = async (imageUrl: string) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/api/update-profile-image`,
            { imageUrl },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Error updating profile image:", error.response?.data || error.message);
        return {
            error: true,
            message: error.response?.data?.message || "Failed to update profile image",
        };
    }
};
export const updateAbout = async (about: string) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/update-about`,
        { about },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error updating about text:", error.response?.data || error.message);
      return { 
        error: true, 
        message: error.response?.data?.message || "Failed to update about text" 
      };
    }
  };

  export const getNotificationCount = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/notification-count`);
        return response.data.data.count;
    } catch (error: any) {
        console.error("Error fetching notification count:", error.response?.data || error.message);
        return 0; 
    }
};
export const deleteNotification = async (notificationId: string) => {
    try {
        const response = await axios.delete(`${BASE_URL}/api/notifications/${notificationId}`);
        return response.data;
    } catch (error: any) {
        console.error("Error deleting notification:", error.response?.data || error.message);
        return { error: true, message: "Failed to delete notification." };
    }
};

export const createOrder = async (amount:number,currency:string='INR') => {
    try {
        const response = await axios.post(`${BASE_URL}/api/order`,{amount,currency});
        return response.data;
    } catch (error: any) {
        console.error("Error fetchng order", error.response?.data || error.message);
        return 0; 
    }
};
export const getNotifications = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/notifications`);
        return response.data;
    } catch (error: any) {
        console.error("Error fetching notifications:", error.response?.data || error.message);
        return { error: true, message: "Failed to fetch notifications." };
    }
};

// Function to create a notification
export const createNotification = async (notificationData: any) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/notifications`, notificationData, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error: any) {
        console.error("Error creating notification:", error.response?.data || error.message);
        return { error: true, message: "Failed to create notification." };
    }
};
export const cancelReservation = async (reservationId: string) => {
    try {
        const response = await axios.delete(`${BASE_URL}/api/reservations/${reservationId}`);
        return response.data;
    } catch (error: any) {
        console.error("Error canceling reservation:", error.response?.data || error.message);
        return { error: true, message: "Failed to cancel reservation." };
    }
};

// Function to interact with wallet (if needed)
export const updateWallet = async (data: any) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/wallet`, data);
        return response.data;
    } catch (error: any) {
        console.error("Error updating wallet:", error.response?.data || error.message);
        return { error: true, message: "Failed to update wallet." };
    }
};
export const createReview = async (reviewData: any) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/reviews`, reviewData, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });
        return response.data;
    } catch (error: any) {
        console.error("Error creating review:", error.response?.data || error.message);
        return { error: true, message: error.response?.data?.error || "Failed to create review." };
    }
};

// ✅ Update a Review
export const updateReview = async (reviewId: string, updatedData: any) => {
    try {
        const response = await axios.put(`${BASE_URL}/api/reviews/${reviewId}`, updatedData, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });
        return response.data;
    } catch (error: any) {
        console.error("Error updating review:", error.response?.data || error.message);
        return { error: true, message: error.response?.data?.error || "Failed to update review." };
    }
};

// ✅ Delete a Review
export const deleteReview = async (reviewId: string) => {
    try {
        const response = await axios.delete(`${BASE_URL}/api/reviews/${reviewId}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error: any) {
        console.error("Error deleting review:", error.response?.data || error.message);
        return { error: true, message: error.response?.data?.error || "Failed to delete review." };
    }
};

// ✅ Fetch Reviews for a Listing
export const getReviews = async (listingId: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/reviews/${listingId}`);
        return response.data;
    } catch (error: any) {
        console.error("Error fetching reviews:", error.response?.data || error.message);
        return { error: true, message: error.response?.data?.error || "Failed to fetch reviews." };
    }
};
export const updateOfferPrice = async (listingId: string, offerPrice: number | null) => {
    try {
        const response = await axios.put(
            `${BASE_URL}/api/listings/${listingId}/offer`,
            { offerPrice },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Error updating offer price:", error.response?.data || error.message);
        return { error: true, message: error.response?.data?.error || "Failed to update offer price." };
    }
};