// app/admin/hostManagement/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../components/Sidebar";
import { getAllHosts, restrictHost, unrestrictHost, sendNotification } from "../../../services/adminApi";

export const dynamic = "force-dynamic";

interface Host {
  id: string;
  name: string;
  listingCount: number;
  isRestricted: boolean;
}

function HostManagementPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messageHostId, setMessageHostId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/admin");
      return;
    }

    const fetchHosts = async () => {
      try {
        const response = await getAllHosts(1, 10);
        if ("error" in response) {
          setError(response.message);
          if (response.message.includes("authorization")) {
            router.push("/admin");
          }
        } else {
          setHosts(response.data);
        }
      } catch (err) {
        setError("Failed to load hosts");
      } finally {
        setLoading(false);
      }
    };
    fetchHosts();
  }, [router]);

  const toggleRestriction = async (hostId: string, isRestricted: boolean) => {
    try {
      const response = isRestricted ? await unrestrictHost(hostId) : await restrictHost(hostId);
      if ("error" in response) {
        toast.error(response.message);
      } else {
        setHosts((prevHosts) =>
          prevHosts.map((host) =>
            host.id === hostId ? { ...host, isRestricted: !isRestricted } : host
          )
        );
        toast.success(`Host ${isRestricted ? "unrestricted" : "restricted"} successfully`);
      }
    } catch (error) {
      toast.error("Failed to update host restriction");
      console.error("Failed to update host restriction", error);
    }
  };

  const handleSendMessage = async (hostId: string) => {
    if (!message.trim()) return;
    try {
      const response = await sendNotification(hostId, message, "info");
      if ("error" in response) {
        toast.error(response.message);
      } else {
        setMessage("");
        setMessageHostId(null);
        toast.success("Message sent successfully");
      }
    } catch (error) {
      toast.error("Failed to send notification");
      console.error("Failed to send notification", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <div className="w-64">
        <Sidebar />
      </div>

      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-purple-400 mb-8">Host Management Dashboard</h1>

        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 animate-spin"></div>
          </div>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {hosts.map((host) => (
              <div
                key={host.id}
                className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700"
              >
                <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white">{host.name}</h2>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="ml-2 text-gray-300">{host.listingCount} Listings</span>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                          host.isRestricted ? "bg-red-900 text-red-200" : "bg-green-900 text-green-200"
                        }`}
                      >
                        {host.isRestricted ? "Restricted" : "Active"}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleRestriction(host.id, host.isRestricted)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                        host.isRestricted
                          ? "bg-purple-800 text-purple-200 hover:bg-purple-700"
                          : "bg-red-800 text-red-200 hover:bg-red-700"
                      }`}
                    >
                      {host.isRestricted ? "Allow Listing" : "Restrict from Listing"}
                    </button>
                    <button
                      onClick={() =>
                        setMessageHostId(messageHostId === host.id ? null : host.id)
                      }
                      className="px-4 py-2 rounded-lg bg-blue-800 text-blue-200 hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                      {messageHostId === host.id ? "Cancel" : "Message"}
                    </button>
                  </div>
                </div>
                {messageHostId === host.id && (
                  <div className="p-4 border-t border-gray-700">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                    <button
                      onClick={() => handleSendMessage(host.id)}
                      className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors duration-200"
                    >
                      Send Message
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <ToastContainer position="top-center" autoClose={3000} />
      </main>
    </div>
  );
}

export default HostManagementPage;