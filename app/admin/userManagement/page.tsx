"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import Sidebar from "../../components/Sidebar";
import { FaUserCircle } from "react-icons/fa";
import { getAllUsers, blockUser, unblockUser } from "@/services/adminApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../hooks/useAuth"; 
import debounce from "lodash/debounce";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  isBlocked: boolean;
}

const ToggleSwitch = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
}) => (
  <button
    type="button"
    onClick={onChange}
    disabled={disabled}
    className={`
      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
      border-2 border-transparent transition-colors duration-200 ease-in-out 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      ${checked ? "bg-green-500" : "bg-gray-600"}
      ${disabled ? "opacity-50 cursor-not-allowed" : ""} 
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-5 w-5 transform rounded-full 
        bg-white shadow ring-0 transition duration-200 ease-in-out
        ${checked ? "translate-x-5" : "translate-x-0"}
      `}
    />
  </button>
);

function UserManagement() {
  const [userData, setUserData] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Debounced function to fetch users
  const fetchUsers = useCallback(
    debounce(async (page: number, query: string) => {
      setError(null);
      setLoading(true);
      try {
        const response = await getAllUsers(page, 8, query);
        if (!response.error && response.data) {
          setUserData(response.data);
          setTotalPages(response.totalPages);
        } else {
          setError(response.message || "Failed to fetch users");
          setUserData([]);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to fetch users";
        setError(message);
        setUserData([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin");
      return;
    }

    if (isAuthenticated) fetchUsers(currentPage, searchQuery);
  }, [currentPage, searchQuery, isAuthenticated, authLoading, router, fetchUsers]);

  async function handleToggle(id: string, isBlocked: boolean): Promise<void> {
    setActionLoading(id);
    try {
      if (isBlocked) {
        await unblockUser(id);
        toast.success("User unblocked successfully!");
      } else {
        await blockUser(id);
        toast.success("User blocked successfully!");
      }

      setUserData((prevState) =>
        prevState.map((user) => (user.id === id ? { ...user, isBlocked: !isBlocked } : user))
      );
    } catch (error: unknown) {
      console.error("Error toggling block status:", error);
      toast.error("Failed to update block status. Please try again.");
      setError("Failed to update block status.");
    } finally {
      setActionLoading(null);
    }
  }

  const Pagination = () => (
    <div className="flex justify-center items-center space-x-4 mt-6">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1 || loading}
        className={`px-4 py-2 rounded-md text-white ${
          currentPage === 1 || loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        Previous
      </button>

      <div className="flex items-center space-x-1">
        <span className="text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages || loading}
        className={`px-4 py-2 rounded-md text-white ${
          currentPage === totalPages || loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        Next
      </button>
    </div>
  );

  const renderTable = () => {
    if (loading || authLoading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 animate-spin"></div>
        </div>
      );
    }

    return (
      <>
        <div className="bg-gray-800 text-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Active/Blocked
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {userData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  userData.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name || "User"}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-xl text-white">
                              <FaUserCircle />
                            </div>
                          )}
                          <span className="ml-4 font-medium text-gray-300">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isBlocked
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <ToggleSwitch
                            checked={!user.isBlocked}
                            onChange={() => handleToggle(user.id, user.isBlocked)}
                            disabled={actionLoading === user.id}
                          />
                          {actionLoading === user.id && (
                            <span className="text-sm text-gray-500">Processing...</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination />
      </>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <div className="w-64">
        <Sidebar />
      </div>

      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">User Management</h1>

        {/* Search Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-md bg-gray-800 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <ToastContainer />

        {renderTable()}
      </main>
    </div>
  );
}

export default UserManagement;