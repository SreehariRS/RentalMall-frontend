"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type React from "react";
import { useEffect, useState } from "react";
import { getProfile, getFavoriteListings, updateProfileImage, updateAbout } from "../../../services/userApi";
import { MapPin, Settings, Shield, Heart, Mail, Phone, Calendar, CameraIcon, Edit, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import Loader from "@/app/components/Loader";

// Add this line to make the page dynamic
export const dynamic = "force-dynamic";

// Define interfaces for better type safety
interface User {
  name?: string;
  location?: string;
  createdAt?: string;
  image?: string;
  email?: string;
  phone?: string;
  about?: string;
  role?: string;
}

interface FavoriteListing {
  id: string;
  // Add other relevant fields
}

const UserProfile = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [favoriteListings, setFavoriteListings] = useState<FavoriteListing[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [editedAbout, setEditedAbout] = useState("");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleChangePassword = () => {
    router.push("/user/changePassword");
    setIsDropdownOpen(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPEG, PNG, or GIF.");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "");

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ""}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      const updateResult = await updateProfileImage(data.secure_url);

      if (updateResult.status) {
        setUser((prevUser) => (prevUser ? { ...prevUser, image: data.secure_url } : null));
        toast.success("Profile image updated successfully");
      } else {
        toast.error(updateResult.message || "Failed to update profile image");
      }
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error("Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAbout = async () => {
    try {
      const result = await updateAbout(editedAbout);
      if (result.status) {
        setUser((prev) => (prev ? { ...prev, about: editedAbout } : null));
        setIsEditingAbout(false);
        toast.success("About text updated successfully");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update about text");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await getProfile();
        if (profileData && !profileData.error) {
          setUser(profileData);
          setEditedAbout(profileData.about || "");
        } else {
          console.error("Error fetching profile:", profileData?.message || "Unknown error");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <Loader />;
  if (!user) return <p>User data not found.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden group">
              <Image
                src={user.image || "/images/profile.png"}
                alt={user.name || "User"}
                width={128}
                height={128}
                className="object-cover"
              />
              <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <CameraIcon className="w-8 h-8 text-white" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.name || "Anonymous"}</h1>
              <div className="flex items-center text-gray-600 space-x-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{user.location || "Location not provided"}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={toggleDropdown}
              aria-label="Settings"
            >
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                <ul className="py-2">
                  <li>
                    <button
                      className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                      onClick={handleChangePassword}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-3">
          <Heart className="w-6 h-6 text-rose-500" />
          <div>
            <p className="text-lg font-semibold">{favoriteListings.length}</p>
            <p className="text-gray-600">Favorites</p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-3">
          <Mail className="w-6 h-6 text-blue-500" />
          <div>
            <p className="text-lg font-semibold">{user.email || "Not Provided"}</p>
            <p className="text-gray-600">Email Verified</p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-3">
          <Phone className="w-6 h-6 text-green-500" />
          <div>
            <p className="text-lg font-semibold">{user.phone || "Not Provided"}</p>
            <p className="text-gray-600">{user.phone ? "Phone Verified" : "Not Verified"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">About</h2>
          {!isEditingAbout ? (
            <button
              onClick={() => setIsEditingAbout(true)}
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
              aria-label="Edit about section"
            >
              <Edit className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveAbout}
                className="text-green-600 hover:text-green-800 transition-colors duration-200"
                aria-label="Save changes"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setEditedAbout(user.about || "");
                  setIsEditingAbout(false);
                }}
                className="text-red-600 hover:text-red-800 transition-colors duration-200"
                aria-label="Cancel editing"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        {!isEditingAbout ? (
          <p className="text-gray-700">{user.about || "No bio available."}</p>
        ) : (
          <textarea
            value={editedAbout}
            onChange={(e) => setEditedAbout(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            rows={4}
            placeholder="Tell us about yourself..."
          />
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium">Role</p>
              <p className="text-gray-600">{user.role || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;