"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getProfile, getFavoriteListings } from "../../../services/userApi";
import { MapPin, Star, Settings, Shield, BookOpen, Heart, Mail, Phone, Calendar } from "lucide-react";
import LoadingSpinner from "../../components/ui/Spinner";


const UserProfile = () => {
  const router = useRouter(); 
    const [user, setUser] = useState<any>(null);
    const [favoriteListings, setFavoriteListings] = useState<any[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Loading state

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    const handleChangePassword = () => {
      router.push('/user/changePassword');
      setIsDropdownOpen(false); // Close dropdown after clicking
  };

    // Fetch user profile and favorite listings
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch profile
                const profileData = await getProfile();
                if (profileData && !profileData.error) {
                    setUser(profileData); // Ensure it matches the backend response
                } else {
                    console.error("Error fetching profile:", profileData.message || "Unknown error");
                }

                // // Fetch favorite listings
                // const favoritesData = await getFavoriteListings();
                // console.log("Fetched favorite listings:", favoritesData); // Debug log
                // if (favoritesData && !favoritesData.error) {
                //   setFavoriteListings(favoritesData);
                // } else {
                //   console.error("Error fetching favorite listings:", favoritesData.message || "Unknown error");
                // }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false); // End loading
            }
        };

        fetchData();
    }, []);

    // Display loading state
    if (isLoading) {
        return <LoadingSpinner/>;
    }

    // If no user data, display an error
    if (!user) {
        return <p>User data not found.</p>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50">
            {/* Header Section */}
            <div className="bg-white rounded-xl p-8 shadow-sm mb-6 relative">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-6 items-start">
                        <div className="w-32 h-32 rounded-full overflow-hidden">
                            <img
                                src={user.image || "/images/profile.png"}
                                alt={user.name || "User"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{user.name || "Anonymous"}</h1>
                            <div className="flex flex-col gap-2 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {user.location || "Location not provided"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Member since {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Role: {user.role}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <button className="p-2 hover:bg-gray-100 rounded-full" onClick={toggleDropdown}>
                            <Settings className="w-6 h-6 text-gray-600" />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border">
                                <ul className="py-2">
                                    <li>
                                    <button
                            className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                            onClick={handleChangePassword} // Update this line
                        >
                            Change Password
                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                                            onClick={() => alert("Account Settings Clicked")}
                                        >
                                            Account Settings
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-b">
                    <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-rose-600" />
                        <div>
                            <p className="font-medium">{favoriteListings.length} Favorites</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="font-medium">{user.email || "Not Provided"}</p>
                            <p className="text-sm text-gray-500">Email Verified</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="font-medium">{user.phone || "Not Provided"}</p>
                            <p className="text-sm text-gray-500">{user.phone ? "Phone Verified" : "Not Verified"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-gray-600">{user.about || "No bio available."}</p>
            </div>

            {/* Past Favorites
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Favorite Listings</h2>
        {favoriteListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteListings.map((listing: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{listing.title}</h3>
                <p className="text-gray-600">{listing.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No favorite listings yet.</p>
        )}
      </div> */}
        </div>
    );
};

export default UserProfile;
