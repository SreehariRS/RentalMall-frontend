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
  Area,
  AreaChart,
} from "recharts";
import Sidebar from "../../components/Sidebar";
import { Users, BookOpen, Home, TrendingUp, Activity, PieChart as PieChartIcon, BarChart2 } from "lucide-react";
import { getDashboardStats } from "../../../services/adminApi";
import Loader from "@/app/components/Loader";
import { useAuth } from "../../hooks/useAuth"; // Add useAuth

interface MonthlyBooking {
  month: string;
  bookings: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface DashboardStats {
  totalUsers: number;
  usersGrowth: number;
  totalBookings: number;
  bookingsGrowth: number;
  totalListings: number;
  listingsGrowth: number;
  totalHosts: number;
  hostsGrowth: number;
  monthlyBookings: MonthlyBooking[];
  bookingsByCategory: CategoryData[];
  listingsByCategory: CategoryData[];
  [key: string]: number | MonthlyBooking[] | CategoryData[];
}

function DarkDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin");
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        if ("error" in data) {
          setError(data.message);
          if (data.message.includes("authorization")) {
            router.push("/admin");
          }
        } else {
          const extendedBookingData = extendMonthlyData(data.monthlyBookings);
          setStats({
            ...data,
            monthlyBookings: extendedBookingData,
          });
        }
      } catch (err) {
        setError("Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchStats();
  }, [router, isAuthenticated, authLoading]);

  const extendMonthlyData = (data: MonthlyBooking[]): MonthlyBooking[] => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dataMap = new Map(data.map((item) => [item.month, item.bookings]));
    return months.map((month) => ({
      month,
      bookings: dataMap.get(month) || 0,
    }));
  };

  const COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#0ea5e9", "#10b981", "#f59e0b"];
  const gradientOffset = () => {
    if (!stats?.monthlyBookings.length) return 0;
    const dataMax = Math.max(...stats.monthlyBookings.map((i) => i.bookings));
    const dataMin = Math.min(...stats.monthlyBookings.map((i) => i.bookings));
    return dataMax !== dataMin ? dataMin / dataMax : 0;
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-gray-950 justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-950 justify-center items-center">
        <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-red-500/20">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Occurred</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => router.push("/admin")}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-200">
      <div className="w-72 bg-gray-900 shadow-2xl border-r border-gray-800/50">
        <Sidebar />
      </div>

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">
              Dashboard
              <span className="ml-2 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Overview</span>
            </h1>
            <p className="text-gray-400">Track your platform's performance metrics</p>
          </div>
          <div className="flex items-center space-x-2 bg-gray-900 p-3 rounded-xl border border-gray-800/50">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-gray-300 font-medium">Welcome, Admin</div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: Users,
              label: "Total Users",
              color: "indigo",
              stat: "totalUsers" as keyof DashboardStats,
              growth: "usersGrowth" as keyof DashboardStats,
              description: "Active platform users",
            },
            {
              icon: BookOpen,
              label: "Total Bookings",
              color: "purple",
              stat: "totalBookings" as keyof DashboardStats,
              growth: "bookingsGrowth" as keyof DashboardStats,
              description: "Completed reservations",
            },
            {
              icon: Home,
              label: "Total Listings",
              color: "pink",
              stat: "totalListings" as keyof DashboardStats,
              growth: "listingsGrowth" as keyof DashboardStats,
              description: "Available properties",
            },
            {
              icon: Users,
              label: "Total Hosts",
              color: "cyan",
              stat: "totalHosts" as keyof DashboardStats,
              growth: "hostsGrowth" as keyof DashboardStats,
              description: "Property managers",
            },
          ].map(({ icon: Icon, label, color, stat, growth, description }) => (
            <div key={stat} className={`bg-gray-900 rounded-2xl p-6 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-gradient-to-br from-transparent to-gray-800/30 rounded-full opacity-50"></div>

              <div className="flex justify-between items-start mb-4">
                <div className="z-10">
                  <div className={`p-3 rounded-xl bg-${color}-500/10 inline-block`}>
                    <Icon className={`text-${color}-500`} size={22} />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{description}</p>
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    stats && typeof stats[growth] === "number" && stats[growth] >= 0
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  } font-medium`}
                >
                  {stats && typeof stats[growth] === "number" ? (stats[growth] >= 0 ? "+" : "") + stats[growth] : 0}%
                </div>
              </div>

              <h3 className="text-3xl font-bold mt-2 z-10">
                {stats && typeof stats[stat] === "number" ? stats[stat].toLocaleString() : 0}
              </h3>
              <p className="text-sm text-gray-400 mt-1 z-10">{label}</p>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 z-0">
                <div
                  className={`h-full bg-${color}-500`}
                  style={{
                    width: `${stats && typeof stats[growth] === "number" ? Math.min(Math.max(stats[growth], 0), 100) : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Activity className="mr-3 text-purple-500" size={24} />
                Yearly Booking Trends
              </h2>
              <p className="text-gray-400 text-sm mt-1">Performance over the last 12 months</p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded-lg transition-colors">
                Year
              </button>
              <button className="bg-gray-800/40 hover:bg-gray-800 text-gray-300 px-4 py-2 text-sm rounded-lg transition-colors">
                Month
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={stats?.monthlyBookings ?? []}>
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#27272a" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa" }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa" }} width={50} />
              <Tooltip
                contentStyle={{
                  background: "rgba(24,24,27,0.9)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: "10px",
                  color: "#e4e4e7",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorBookings)"
                activeDot={{ r: 8, strokeWidth: 0, fill: "#8b5cf6" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <PieChartIcon className="mr-3 text-indigo-500" size={24} />
                  Bookings By Category.
                </h2>
                <p className="text-gray-400 text-sm mt-1">Distribution across property types</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={stats?.bookingsByCategory || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={130}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {(stats?.bookingsByCategory || []).map((entry: CategoryData, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(24,24,27,0.9)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#e4e4e7",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                  formatter={(value, name, props) => [`${value} bookings`, props.payload.name]}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    color: "#a1a1aa",
                    fontSize: "12px",
                    paddingLeft: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <BarChart2 className="mr-3 text-pink-500" size={24} />
                  Listings By Category
                </h2>
                <p className="text-gray-400 text-sm mt-1">Property type distribution</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats?.listingsByCategory || []} barSize={40}>
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient key={`gradient-${index}`} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.4} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#27272a" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#a1a1aa" }}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa" }} width={50} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(24,24,27,0.9)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#e4e4e7",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                  formatter={(value, name, props) => [`${value} listings`, props.payload.name]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {(stats?.listingsByCategory || []).map((entry: CategoryData, index: number) => (
                    <Cell key={`cell-${index}`} fill={`url(#barGradient${index % COLORS.length})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DarkDashboard;