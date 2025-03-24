import axiosInstance from "./axiosInstance";

interface Reservation {
  id: string;
  userId: string;
  listingId: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  guestName: string;
  hostName: string;
  propertyName: string;
}

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
    const response = await axiosInstance.post("/api/admin", { email, password });
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    console.log("Login successful:", { accessToken, refreshToken });
    return response.data;
  } catch (error: any) {
    console.error("Error in logging in admin:", error);
    const errorMessage = error.response?.data?.message || "Failed to login admin.";
    return { error: true, message: errorMessage };
  }
};

export const getAllUsers = async (page: number = 1, limit: number = 8) => {
  try {
    const response = await axiosInstance.get(`/api/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error("Error in fetching users:", error);
    const errorMessage = error.response?.data?.message || "Failed to fetch users.";
    return { error: true, message: errorMessage };
  }
};

export const blockUser = async (userId: string) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/users/${userId}/block`);
    return response.data;
  } catch (error: any) {
    console.error("Error blocking user:", error);
    return { error: true, message: error.response?.data?.message || "Failed to block user" };
  }
};

export const unblockUser = async (userId: string) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/users/${userId}/unblock`);
    return response.data;
  } catch (error: any) {
    console.error("Error in unblocking user:", error);
    const errorMessage = error.response?.data?.message || "Failed to unblock the user.";
    return { error: true, message: errorMessage };
  }
};

export const getAllHosts = async (page: number, limit: number) => {
  try {
    const response = await axiosInstance.get("/api/admin/hosts", { params: { page, limit } });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching hosts:", error);
    return { error: true, message: error.response?.data?.message || "Failed to fetch hosts" };
  }
};

export const restrictHost = async (userId: string) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/users/${userId}/restrict`);
    return response.data;
  } catch (error: any) {
    console.error("Error restricting host:", error);
    return { error: true, message: error.response?.data?.message || "Failed to restrict host" };
  }
};

export const unrestrictHost = async (userId: string) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/users/${userId}/unrestrict`);
    return response.data;
  } catch (error: any) {
    console.error("Error unrestricting host:", error);
    return { error: true, message: error.response?.data?.message || "Failed to unrestrict host" };
  }
};

export const sendNotification = async (userId: string, message: string, type: string) => {
  try {
    const response = await axiosInstance.post("/api/admin/notifications", { userId, message, type });
    return response.data;
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return { error: true, message: error.response?.data?.message || "Failed to send notification" };
  }
};

export const getAllReservations = async (page: number = 1, limit: number = 8): Promise<PaginatedReservationResponse | { error: true; message: string }> => {
  try {
    const response = await axiosInstance.get(`/api/admin/reservations?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error("Error in fetching reservations:", error);
    const errorMessage = error.response?.data?.message || "Failed to fetch reservations.";
    return { error: true, message: errorMessage };
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get("/api/admin/dashboard-stats");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return { error: true, message: error.response?.data?.message || "Failed to fetch dashboard stats" };
  }
};