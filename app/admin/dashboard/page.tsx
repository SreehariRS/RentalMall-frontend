"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from "recharts";
import Sidebar from "../../components/Sidebar";
import { Users, BookOpen, Home, TrendingUp } from "lucide-react";
import { getDashboardStats } from "../../../services/adminApi";
import Loader from "@/app/components/Loader";

type VerticalAlignmentType = "top" | "middle" | "bottom";

function DarkDashboard() {
    const router = useRouter();

    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            router.push("/admin");
        }
    }, [router]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                if (data.error) {
                    setError(data.message);
                } else {
                    const extendedBookingData = extendMonthlyData(data.monthlyBookings);
                    setStats({
                        ...data,
                        monthlyBookings: extendedBookingData,
                    });
                }
            } catch (error) {
                setError("Failed to fetch dashboard stats");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const extendMonthlyData = (data: any[]) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dataMap = new Map(data.map((item) => [item.month, item.bookings]));
        return months.map((month) => ({
            month,
            bookings: dataMap.get(month) || 0,
        }));
    };

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6384", "#36A2EB"];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-200">
            {/* Sidebar always visible */}
            <div className="w-72 bg-gray-800 shadow-2xl border-r border-gray-700">
                <Sidebar />
            </div>

            {/* Main content area */}
            <main className="flex-1 p-8 space-y-8">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader />
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center">Error: {error}</div>
                ) : (
                    <>
                        <header className="flex justify-between items-center mb-8">
                            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                                Dashboard
                            </h1>
                            <div className="text-gray-400">Welcome, Admin</div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { icon: Users, color: "blue", stat: "totalUsers", growth: "usersGrowth" },
                                { icon: BookOpen, color: "red", stat: "totalBookings", growth: "bookingsGrowth" },
                                { icon: Home, color: "purple", stat: "totalListings", growth: "listingsGrowth" },
                                { icon: Users, color: "green", stat: "totalHosts", growth: "hostsGrowth" },
                            ].map(({ icon: Icon, color, stat, growth }) => (
                                <div
                                    key={stat}
                                    className={`bg-gray-800 border-2 border-gray-700 rounded-xl p-6 transform transition-all hover:scale-105 hover:shadow-2xl`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <Icon className={`text-${color}-400`} size={32} />
                                        <span className="text-sm text-gray-500 uppercase tracking-wider">
                                            {stat.replace("total", "Total ")}
                                        </span>
                                    </div>
                                    <p className={`text-4xl font-bold text-${color}-400`}>{stats[stat]}</p>
                                    <div className="text-sm text-green-500 mt-2">{stats[growth]}% from last month</div>
                                </div>
                            ))}
                        </div>

                        {/* Yearly Booking Trends */}
                        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-200 flex items-center">
                                    <TrendingUp className="mr-3 text-purple-500" size={24} />
                                    Yearly Booking Trends
                                </h2>
                                <div className="text-sm text-gray-500">Full Year Overview</div>
                            </div>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={stats.monthlyBookings}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={true}
                                        vertical={false}
                                        stroke="#2d3748"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#a0aec0" }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a0aec0" }} />
                                    <Tooltip
                                        contentStyle={{
                                            background: "rgba(45,55,72,0.9)",
                                            border: "none",
                                            borderRadius: "10px",
                                            color: "#e2e8f0",
                                            boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="bookings"
                                        stroke="#8a4fff"
                                        strokeWidth={3}
                                        dot={{ r: 6, fill: "#8a4fff" }}
                                        activeDot={{ r: 8, fill: "#8a4fff" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* New Category Charts Section */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Bookings Per Category - Pie Chart */}
                            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-gray-700">
                                <h2 className="text-2xl font-semibold text-gray-200 mb-4">Bookings Per Category</h2>
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={stats.bookingsByCategory || []}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {(stats.bookingsByCategory || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: "rgba(45,55,72,0.9)",
                                                border: "none",
                                                borderRadius: "10px",
                                                color: "#e2e8f0",
                                            }}
                                        />
                                        <Legend
                                            layout="vertical"
                                            verticalAlign={"right" as VerticalAlignmentType}
                                            wrapperStyle={{ color: "#a0aec0" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Listings Per Category - Bar Chart */}
                            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-gray-700">
                                <h2 className="text-2xl font-semibold text-gray-200 mb-4">Listings Per Category</h2>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={stats.listingsByCategory || []}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={true}
                                            vertical={false}
                                            stroke="#2d3748"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#a0aec0" }}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a0aec0" }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: "rgba(45,55,72,0.9)",
                                                border: "none",
                                                borderRadius: "10px",
                                                color: "#e2e8f0",
                                            }}
                                        />
                                        <Bar dataKey="value">
                                            {(stats.listingsByCategory || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default DarkDashboard;
