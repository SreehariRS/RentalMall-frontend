import axios from "axios";

// Base API URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
    const errorMessage =
      error.response?.data?.message || "Failed to add to favorites.";
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
    const errorMessage =
      error.response?.data?.message || "Failed to remove from favorites.";
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
export const changePassword = async (newPassword: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/change-password`,
      { newPassword },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    // Type guard to check if error is AxiosError
    if (axios.isAxiosError(error)) {
      console.error("Error changing password:", error.response?.data);
      return { 
        error: true, 
        message: error.response?.data?.error || "Failed to change password." 
      };
    }
    // Handle non-Axios errors
    console.error("Error changing password:", error);
    return { 
      error: true, 
      message: "An error occurred while changing password." 
    };
  }
};
