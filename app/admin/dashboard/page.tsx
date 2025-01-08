
"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";

function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in by checking localStorage for token
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin"); // Redirect to login page if no token found
    }
  }, [router]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-700">Total Number of Users</h2>
            <p className="text-3xl font-bold text-blue-500 mt-2">1,245</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-700">Total Number of Hosts</h2>
            <p className="text-3xl font-bold text-green-500 mt-2">342</p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-700">Total Bookings</h2>
            <p className="text-3xl font-bold text-red-500 mt-2">2,157</p>
          </div>
        </div>

        {/* Graph Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Monthly Bookings</h2>
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Graph</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
