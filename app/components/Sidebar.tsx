"use client";
import { useRouter } from "next/navigation";
import { FaHome, FaUsers, FaUserTie, FaClipboardList, FaEnvelope, FaBars } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    // Clear session (token)
    localStorage.removeItem("adminToken");
    // Redirect to login page
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {/* Sidebar */}
      <aside
        className={`lg:w-64 w-64 bg-blue-900 text-white flex flex-col transition-all duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:block fixed top-0 left-0 h-full z-50`}
      >
        {/* Sidebar Header */}
        <div className="p-6 bg-blue-800">
          <h1 className="text-3xl font-bold text-center tracking-wide">Admin Panel</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-4">
            <li>
              <Link href="/admin/dashboard" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-700 transition">
                <FaHome className="text-xl" />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/userManagement" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-700 transition">
                <FaUsers className="text-xl" />
                <span className="text-sm font-medium">Users</span>
              </Link>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-700 transition">
                <FaUserTie className="text-xl" />
                <span className="text-sm font-medium">Hosts</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-700 transition">
                <FaClipboardList className="text-xl" />
                <span className="text-sm font-medium">Bookings</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-blue-700 transition">
                <FaEnvelope className="text-xl" />
                <span className="text-sm font-medium">Send Message to Host</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="bg-blue-800 p-4">
          <button onClick={handleLogout} className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
            Logout
          </button>
        </div>
      </aside>

      {/* Hamburger Icon for Small Screens */}
      <button className="lg:hidden p-2 absolute top-0 left-1 text-black rounded-full z-50" onClick={toggleSidebar}>
        <FaBars className="text-2xl" />
      </button>
    </div>
  );
}
