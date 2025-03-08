import axios from "axios";

// Base API URL from environment variables
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;


interface Reservation {
  id: string;
  userId: string;
  listingId: string;
  startDate: string;  // For easier handling in the frontend, you might keep it as string
  endDate: string;    // Same for the endDate
  status: string;
  totalPrice: number;
  createdAt: string;
  guestName: string;
  hostName: string;
  propertyName: string;
}

// Type for the Paginated Response for Reservations
interface PaginatedReservationResponse {
  data: Reservation[];
  total: number;
  currentPage: number;
  totalPages: number;
}
interface Host {
  id: string;
  name: string;
  listingCount: number;
  isRestricted: boolean;
}

interface PaginatedHostResponse {
  data: Host[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const loginAdmin = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin`, // Login API endpoint
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // Return the response data (e.g., token or admin info)
  } catch (error: any) {
    console.error("Error in logging in admin:", error);

    // Normalize error handling
    const errorMessage =
      error.response?.data?.message || "Failed to login admin.";
    return { error: true, message: errorMessage };
  }
};

export const getAllUsers = async (page: number = 1, limit: number = 8) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/admin/users?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error in fetching users:", error);
    const errorMessage = error.response?.data?.message || "Failed to fetch users.";
    return { error: true, message: errorMessage };
  }
};

// Block a user
export const blockUser = async (userId: string) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/api/admin/users/${userId}/block`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // Return the updated user data
  } catch (error: any) {
    console.error("Error in blocking user:", error);
    // Normalize error handling
    const errorMessage =
      error.response?.data?.message || "Failed to block the user.";
    return { error: true, message: errorMessage };
  }
};

// Unblock a user
export const unblockUser = async (userId: string) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/api/admin/users/${userId}/unblock`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // Return the updated user data
  } catch (error: any) {
    console.error("Error in unblocking user:", error);
    // Normalize error handling
    const errorMessage =
      error.response?.data?.message || "Failed to unblock the user.";
    return { error: true, message: errorMessage };
  }
};

export const getAllHosts = async (page: number = 1, limit: number = 10): Promise<PaginatedHostResponse | { error: true; message: string }> => {
  if (!BASE_URL) {
    return { error: true, message: "API base URL is not defined." };
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/api/admin/hosts?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error in fetching hosts:", error);
    const errorMessage = error.response?.data?.message || "Failed to fetch hosts.";
    return { error: true, message: errorMessage };
  }
};
export const getAllReservations = async (page: number = 1, limit: number = 8): Promise<PaginatedReservationResponse | { error: true; message: string }> => {
  if (!BASE_URL) {
    return { error: true, message: "API base URL is not defined." };
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/api/admin/reservations?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error in fetching reservations:", error);
    const errorMessage = error.response?.data?.message || "Failed to fetch reservations.";
    return { error: true, message: errorMessage };
  }
};

//dashboard
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/dashboard-stats`);
    return response.data; // Now this includes totalHosts
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return { error: true, message: error.response?.data?.message || "Failed to fetch dashboard stats" };
  }
}


