"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { FaUserCircle } from "react-icons/fa";
import { getAllUsers, blockUser, unblockUser } from "@/services/adminApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  isBlocked: boolean;
}

interface PaginatedResponse {
  users: User[];
  total: number;
  currentPage: number;
  totalPages: number;
}

// Custom Toggle Switch Component
const ToggleSwitch = ({ 
  checked, 
  onChange, 
  disabled 
}: { 
  checked: boolean; 
  onChange: () => void; 
  disabled: boolean 
}) => (
  <button
    type="button"
    onClick={onChange}
    disabled={disabled}
    className={`
      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
      border-2 border-transparent transition-colors duration-200 ease-in-out 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      ${checked ? 'bg-green-500' : 'bg-gray-200'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-5 w-5 transform rounded-full 
        bg-white shadow ring-0 transition duration-200 ease-in-out
        ${checked ? 'translate-x-5' : 'translate-x-0'}
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

  useEffect(() => {
    const fetchUsers = async () => {
      setError(null);
      setLoading(true);
      try {
        const response = await getAllUsers(currentPage);
        if (!response.error) {
          setUserData(response.users);
          setTotalPages(response.totalPages);
        } else {
          setError(response.message || "Failed to fetch users");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

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
        prevState.map((user) =>
          user.id === id ? { ...user, isBlocked: !isBlocked } : user
        )
      );
    } catch (err: any) {
      console.error("Error toggling block status:", err);
      toast.error("Failed to update block status. Please try again.");
      setError("Failed to update block status.");
    } finally {
      setActionLoading(null);
    }
  }

  const Pagination = () => (
    <div className="flex justify-center items-center space-x-4 mt-6">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1 || loading}
        className={`px-4 py-2 rounded-md ${
          currentPage === 1 || loading
            ? 'bg-gray-200 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        Previous
      </button>
      
      <div className="flex items-center space-x-1">
        <span className="text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
      </div>
      
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages || loading}
        className={`px-4 py-2 rounded-md ${
          currentPage === totalPages || loading
            ? 'bg-gray-200 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <div className="w-64">
        <Sidebar />
      </div>

      <main className="flex-1 bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <ToastContainer />

        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active/Blocked
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userData.length > 0 ? (
                      userData.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.image ? (
                                <img
                                  src={user.image}
                                  alt={user.name || "User"}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-xl text-white">
                                  <FaUserCircle />
                                </div>
                              )}
                              <span className="ml-4 font-medium text-gray-900">
                                {user.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {user.email}
                          </td>
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
                                <span className="text-sm text-gray-500">
                                  Processing...
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination />
          </>
        )}
      </main>
    </div>
  );
}

export default UserManagement;