import userAxiosInstance from "./axiosInstance";



export const addFavorite = async (listingId: string) => {
  try {
    const response = await userAxiosInstance.post("/api/favorites/add", { listingId });
    return response.data;
  } catch (error: any) {
    console.error("Error adding to favorites:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || "Failed to add to favorites.";
    return { error: true, message: errorMessage };
  }
};


export const removeFavorite = async (listingId: string) => {
  try {
    const response = await userAxiosInstance.delete("/api/favorites/remove", {
      data: { listingId },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error removing from favorites:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || "Failed to remove from favorites.";
    return { error: true, message: errorMessage };
  }
};

// favorite listings
export const getFavoriteListings = async () => {
  try {
    const response = await userAxiosInstance.get("/api/favorites");
    console.log("API Response:", response.data); // Debug the API response
    return response.data.listings || [];
  } catch (error: any) {
    console.log(error);
  }
};

//  user profile
export const getProfile = async () => {
  try {
    const response = await userAxiosInstance.get("/api/get-profile");
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return { error: true, message: "Failed to fetch user profile." };
  }
};


// Change password
export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await userAxiosInstance.post("/api/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error: any) {

    console.error("Error changing password:", error.response?.data || error.message);
    return {
      error: true,
      message: error.response?.data?.error || "Failed to change password.",
    };
  }
};


export const getListingById = async (listingId: string) => {
  try {
    const response = await userAxiosInstance.get(`/api/listings/${listingId}`);
    return response.data;

  } catch (error: any) {
    console.error("Error fetching listing:", error.response?.data || error.message);

    return { error: true, message: "Failed to fetch listing details." };
  }
};


export const getListingsByCategory = async (category: string) => {
  try {
    const response = await userAxiosInstance.get("/api/listings", {
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
    const response = await userAxiosInstance.post("/api/listings", listingData);
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
    const response = await userAxiosInstance.post("/api/messages", messageData);

    return response.data;

  } catch (error: any) {
    console.error("Error creating message:", error.response?.data || error.message);
    return { error: true, message: "Failed to send message." };
  }
};


export const markMessageAsSeen = async (conversationId: string) => {
  try {
    const response = await userAxiosInstance.post(`/api/messages/seen/${conversationId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error marking message as seen:", error.response?.data || error.message);

    return { error: true, message: "Failed to mark message as seen." };
  }
};


export const updateProfileImage = async (imageUrl: string) => {
  try {
    const response = await userAxiosInstance.post("/api/update-profile-image", { imageUrl });

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
    const response = await userAxiosInstance.post("/api/update-about", { about });

    return response.data;

  } catch (error: any) {
    console.error("Error updating about text:", error.response?.data || error.message);

    return {
      error: true,
      message: error.response?.data?.message || "Failed to update about text",
    };
  }
};


export const getNotificationCount = async () => {
  try {
    const response = await userAxiosInstance.get("/api/notification-count");
    return response.data.data.count;

  } catch (error: any) {
    console.error("Error fetching notification count:", error.response?.data || error.message);

    return 0;
  }
};


export const deleteNotification = async (notificationId: string) => {
  try {
    const response = await userAxiosInstance.delete(`/api/notifications/${notificationId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting notification:", error.response?.data || error.message);
    return { error: true, message: "Failed to delete notification." };
  }
};

export const createOrder = async (amount: number, currency: string = "INR") => {
  try {
    const response = await userAxiosInstance.post("/api/order", { amount, currency });

    return response.data;

  } catch (error: any) {
    console.error("Error fetching order:", error.response?.data || error.message);
    return 0;
  }
};


export const getNotifications = async () => {
  try {
    const response = await userAxiosInstance.get("/api/notifications");

    return response.data;
  } catch (error: any) {
    console.error("Error fetching notifications:", error.response?.data || error.message);

    return { error: true, message: "Failed to fetch notifications." };
  }
};


export const createNotification = async (notificationData: any) => {
  try {

    const response = await userAxiosInstance.post("/api/notifications", notificationData);
    return response.data;
  } catch (error: any) {
    console.error("Error creating notification:", error.response?.data || error.message);

    return { error: true, message: "Failed to create notification." };
  }
};


export const cancelReservation = async (reservationId: string) => {
  try {

    const response = await userAxiosInstance.delete(`/api/reservations/${reservationId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error canceling reservation:", error.response?.data || error.message);
    return { error: true, message: "Failed to cancel reservation." };

  }
};

export const updateWallet = async (data: any) => {
  try {
    const response = await userAxiosInstance.post("/api/wallet", data);

    return response.data;
  } catch (error: any) {
    console.error("Error updating wallet:", error.response?.data || error.message);

    return { error: true, message: "Failed to update wallet." };
  }
};

export const createReview = async (reviewData: any) => {
  try {
    const response = await userAxiosInstance.post("/api/reviews", reviewData);
    return response.data;
  } catch (error: any) {
    console.error("Error creating review:", error.response?.data || error.message);

    return { error: true, message: error.response?.data?.error || "Failed to create review." };

  }

};

export const updateReview = async (reviewId: string, updatedData: any) => {
  try {
    const response = await userAxiosInstance.put(`/api/reviews/${reviewId}`, updatedData);

    return response.data;
  } catch (error: any) {

    console.error("Error updating review:", error.response?.data || error.message);
    return { error: true, message: error.response?.data?.error || "Failed to update review." };

  }

};

export const deleteReview = async (reviewId: string) => {
  try {
    const response = await userAxiosInstance.delete(`/api/reviews/${reviewId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting review:", error.response?.data || error.message);

    return { error: true, message: error.response?.data?.error || "Failed to delete review." };
  }

};

export const getReviews = async (listingId: string) => {
  try {
    const response = await userAxiosInstance.get(`/api/reviews/${listingId}`);
    return response.data;
  } catch (error: any) {

    console.error("Error fetching reviews:", error.response?.data || error.message);
    return { error: true, message: error.response?.data?.error || "Failed to fetch reviews." };


  }

};

export const updateOfferPrice = async (listingId: string, offerPrice: number | null) => {
  try {
    const response = await userAxiosInstance.put(`/api/listings/${listingId}/offer`, { offerPrice });
    return response.data;

  } catch (error: any) {
    console.error("Error updating offer price:", error.response?.data || error.message);

    return { error: true, message: error.response?.data?.error || "Failed to update offer price." };
  }


};
export const forgotPassword = async (email: string) => {
  try {
    const response = await userAxiosInstance.post("/api/forgot-password", { email });
    return response.data;
  } catch (error: any) {
    console.error("Error in forgotPassword:", error.response?.data || error.message);
    return { error: true, message: error.response?.data?.error || "Failed to send reset link." };
  }
};

export const updateListingPrice = async (listingId: string, price: number) => {
  try {
    const response = await userAxiosInstance.put(`/api/listings/${listingId}/price`, { price });
    return response.data;
  } catch (error: any) {
    console.error("Error updating listing price:", error.response?.data || error.message);
    return { error: true, message: error.response?.data?.error || "Failed to update price." };
  }
};

export const deleteListing = async (listingId: string) => {
  try {
    const response = await userAxiosInstance.delete(`/api/listings/${listingId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting listing:", error.response?.data || error.message);
    return { error: true, message: error.response?.data?.error || "Failed to delete listing." };
  }
};

export const updateListing = async (listingId: string, listingData: any) => {
  try {
    const response = await userAxiosInstance.put(`/api/listings/${listingId}`, listingData);
    return response.data;
  } catch (error: any) {
    console.error("Error updating listing:", error.response?.data || error.message);
    return { error: true, message: error.response?.data?.error || "Failed to update listing." };
  }
};

export const resetPassword = async (token: string, password: string) => {
  try {
    const response = await userAxiosInstance.post("/api/reset-password", { token, password });
    return response.data;
  } catch (error: any) {
    console.error("Error resetting password:", error.response?.data || error.message);
    return { error: true, message: error.response?.data?.error || "Failed to reset password." };
  }
};

export const createReviewOrResponse = async (reviewData: any) => {
  try {
    const response = await userAxiosInstance.post("/api/reviews", reviewData);
    return response.data;
  } catch (error: any) {
    console.error("Error creating review/response:", error.response?.data || error.message);
    return { error: true, message: error.response?.data?.error || "Failed to create review/response." };
  }
};