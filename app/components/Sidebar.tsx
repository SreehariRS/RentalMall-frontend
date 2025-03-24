"use client";
import { useRouter } from "next/navigation";
import { FaHome, FaUsers, FaUserTie, FaClipboardList, FaEnvelope, FaBars, FaSignOutAlt } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";


export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth(); 
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout(); // Call the centralized logout function
  };

  return (
    <div className="min-h-screen flex bg-gray-900 relative">
      <aside
        className={`lg:w-64 w-64 bg-gray-800 text-gray-200 flex flex-col transition-all duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:block fixed top-0 left-0 h-full z-50 border-r border-gray-700`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 bg-gray-900 border-b border-gray-700">
            <h1 className="text-3xl font-bold text-center tracking-wide text-indigo-400">Admin Panel</h1>
          </div>

          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-4">
              {[
                { icon: FaHome, label: "Dashboard", href: "/admin/dashboard" },
                { icon: FaUsers, label: "Users", href: "/admin/userManagement" },
                { icon: FaUserTie, label: "Hosts", href: "/admin/hostManagement" },
                { icon: FaClipboardList, label: "Bookings", href: "/admin/reservationList" },
                { icon: FaEnvelope, label: "Send Message to Host", href: "#" },
              ].map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-700 transition"
                  >
                    <Icon className="text-xl text-indigo-400" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 mt-auto">
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <FaSignOutAlt className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <button
        className="lg:hidden p-2 absolute top-0 left-1 text-gray-200 rounded-full z-50"
        onClick={toggleSidebar}
      >
        <FaBars className="text-2xl" />
      </button>
    </div>
  );
}