"use client";

import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ListingCards from "@/app/components/listings/ListingCards";
import { SafeUser, safelisting } from "@/app/types";
import { useRouter } from "next/navigation";
import { 
  Camera, Settings, Edit, X, Save, Calendar, Mail, 
  Check, Plus, Image, Home, User, Shield
} from "lucide-react";
import useRentModal from "@/app/hooks/useRentModal";

interface UserData {
  fullName: string;
  email: string;
  profileImage: string;
  about: string;
  joinDate: string;
  totalListings: number;
  reviews: number;
  listings: safelisting[];
}

interface ProfileDetailsClientProps {
  user: UserData;
  currentUser?: SafeUser | null;
}

function ProfileDetailsClient({ user, currentUser }: ProfileDetailsClientProps) {
  const router = useRouter();
  const rentModal = useRentModal();
  const [activeTab, setActiveTab] = useState<"about" | "listings">("about");
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(user.about);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);

  // Fetch restriction status
  useEffect(() => {
    const fetchRestrictionStatus = async () => {
      try {
        if (currentUser?.id) {
          const response = await axios.get(`/api/users/${currentUser.id}/restriction-status`);
          setIsRestricted(response.data.isRestricted);
        }
      } catch (error) {
        console.error("Failed to fetch restriction status:", error);
      }
    };

    if (currentUser) {
      fetchRestrictionStatus();
    }
  }, [currentUser]);

  const handleSaveAbout = useCallback(async () => {
    setIsSaving(true);
    try {
      await axios.put("/api/user/update", { about: aboutText });
      toast.success("About section updated successfully!");
      setIsEditingAbout(false);
      user.about = aboutText;
    } catch (error) {
      toast.error("Failed to update about section.");
      console.error("Error updating about:", error);
    } finally {
      setIsSaving(false);
    }
  }, [aboutText]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024;

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
      setIsUploadingImage(true);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ""}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Image upload failed");
      }

      const updateResponse = await axios.put("/api/user/update", { image: data.secure_url });
      if (updateResponse.data.message === "User updated successfully") {
        user.profileImage = data.secure_url;
        toast.success("Profile image updated successfully!");
      } else {
        throw new Error(updateResponse.data.error || "Failed to update profile image");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleChangePassword = () => {
    router.push("/user/changePassword");
    setIsDropdownOpen(false);
  };

  const onRent = useCallback(() => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (isRestricted) {
      toast.error("You are no longer allowed to list properties. Please contact support for more details.");
      return;
    }

    rentModal.onOpen();
  }, [currentUser, rentModal, isRestricted, router]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto pt-6 px-4 sm:px-6 md:px-8">
        {/* Profile header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="relative h-40 bg-gray-200">
            {/* Cover photo area - Rose theme */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-400 opacity-90"></div>
            
            {/* Settings button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={toggleDropdown}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shadow-sm"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10">
                  <ul className="py-1">
                    <li>
                      <button
                        onClick={handleChangePassword}
                        className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Change Password
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Profile info section */}
          <div className="px-6 sm:px-8 relative">
            {/* Profile image */}
            <div className="relative -mt-16 mb-4">
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-white group">
                <img
                  src={user.profileImage}
                  alt={`${user.fullName}'s profile`}
                  className="h-full w-full object-cover"
                />
                <label className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                  />
                </label>
                {isUploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                    <span className="text-white text-sm">Uploading...</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* User info */}
            <div className="pb-6 sm:flex sm:items-end sm:justify-between border-b">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-y-2 sm:gap-x-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Joined {user.joinDate}</span>
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="mt-4 sm:mt-0 flex gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-rose-600">{user.totalListings}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Listings</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-rose-600">{user.reviews}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Reviews</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex px-6 sm:px-8 border-b">
            <button
              onClick={() => setActiveTab("about")}
              className={`flex items-center gap-2 px-4 py-4 font-medium text-sm transition-colors ${
                activeTab === "about"
                  ? "text-rose-600 border-b-2 border-rose-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === "about" ? "text-rose-600" : "text-gray-400"}`} />
              About
            </button>
            <button
              onClick={() => setActiveTab("listings")}
              className={`flex items-center gap-2 px-4 py-4 font-medium text-sm transition-colors ${
                activeTab === "listings"
                  ? "text-rose-600 border-b-2 border-rose-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Home className={`w-4 h-4 ${activeTab === "listings" ? "text-rose-600" : "text-gray-400"}`} />
              Listings
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="mt-6 pb-12">
          {/* About Tab */}
          {activeTab === "about" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* About Me Section */}
              <div className="md:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b">
                  <h2 className="text-lg font-medium text-gray-900">About Me</h2>
                  {!isEditingAbout && (
                    <button
                      onClick={() => setIsEditingAbout(true)}
                      className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
                
                <div className="p-6">
                  {isEditingAbout ? (
                    <div className="space-y-4">
                      <textarea
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        rows={5}
                        placeholder="Tell us about yourself..."
                      />
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setIsEditingAbout(false);
                            setAboutText(user.about);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                          disabled={isSaving}
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={handleSaveAbout}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-50"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>Saving...</>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 leading-relaxed">{user.about}</p>
                  )}
                </div>
              </div>
              
              {/* Verification Section */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden h-fit">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-medium text-gray-900">Verification</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-rose-50 border border-rose-100">
                    <div className="rounded-full bg-rose-100 p-1.5 flex-shrink-0">
                      <Shield className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email verified</p>
                      <p className="text-xs text-gray-500 mt-0.5">Your email address has been verified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Listings Tab */}
          {activeTab === "listings" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-900">My Listings</h2>
                <button
                  onClick={onRent}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Listing</span>
                </button>
              </div>
              
              {user.listings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="rounded-full bg-rose-50 p-3 inline-flex mx-auto mb-4">
                    <Image className="w-7 h-7 text-rose-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Create your first property listing to start showcasing your spaces to potential guests.
                  </p>
                  <button
                    onClick={onRent}
                    className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Listing</span>
                  </button>
                </div>
              ) : (
                /* Reduced size of listings - 5 columns on extra large screens instead of 4 */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {user.listings.map((listing) => (
                    <div key={listing.id} className="transition-transform hover:-translate-y-1 duration-200">
                      <ListingCards data={listing} currentUser={currentUser} disabled={false} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileDetailsClient;