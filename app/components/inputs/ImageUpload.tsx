"use client";

import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { FcOldTimeCamera } from "react-icons/fc";
import { X } from "lucide-react";

interface ImageUploadProps {
  onChange: (value: string[]) => void;
  value: string[];
  maxImages?: number;
}

const ImageUpload = ({
  onChange,
  value = [],
  maxImages = 5,
}: ImageUploadProps) => {
  const [imageUrls, setImageUrls] = useState<string[]>(value);
  const [error, setError] = useState<string>("");

  // Sync internal state with prop changes
  useEffect(() => {
    setImageUrls(value);
  }, [value]);

  const handleUpload = useCallback(
    (result: CloudinaryUploadWidgetResults) => {
      if (result.event !== "success") return;

      const secureUrl = typeof result.info === "object" && "secure_url" in result.info ? result.info.secure_url : null;
      if (!secureUrl || typeof secureUrl !== "string") return;

      setImageUrls((prev) => {
        const updatedUrls = [...prev, secureUrl].slice(0, maxImages);
        setError(updatedUrls.length < maxImages ? `Please upload ${maxImages - updatedUrls.length} more images` : "");
        onChange(updatedUrls); // Notify parent of the change
        return updatedUrls;
      });
    },
    [maxImages, onChange]
  );

  const handleRemoveImage = useCallback(
    (indexToRemove: number) => {
      const updatedUrls = imageUrls.filter((_, index) => index !== indexToRemove);
      setImageUrls(updatedUrls);
      setError(`Please upload ${maxImages - updatedUrls.length} more images`);
      onChange(updatedUrls); // Notify parent after updating local state
    },
    [imageUrls, maxImages, onChange]
  );

  const remainingSlots = maxImages - imageUrls.length;

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm font-medium mb-2">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {imageUrls.map((url, index) => (
          <div key={`${url}-${index}`} className="relative group">
            <div className="relative w-full h-64 overflow-hidden rounded-lg">
              <Image
                alt={` uploaded Image ${index + 1}`}
                src={url}
                layout="fill"
                objectFit="cover"
                className="absolute inset-0"
              />
            </div>
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        ))}

        {remainingSlots > 0 ? (
          <CldUploadWidget
            onSuccess={handleUpload}
            uploadPreset="Rental"
            options={{
              maxFiles: remainingSlots,
              multiple: true,
              sources: ["local", "camera", "url"],
              clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
              maxFileSize: 10000000,
              resourceType: "image",
            }}
          >
            {({ open }) => {
              const handleOpen = () => {
                if (open) {
                  open();
                } else {
                  console.error("Cloudinary upload widget failed to initialize: 'open' function is undefined");
                  setError("Failed to open upload widget. Please try again.");
                }
              };

              return (
                <div
                  onClick={handleOpen}
                  className="relative cursor-pointer hover:opacity-70 transition border-dashed border-2 border-neutral-300 flex flex-col justify-center items-center gap-4 text-neutral-600 p-4 h-64 rounded-lg"
                >
                  <FcOldTimeCamera size={50} />
                  <div className="font-semibold text-lg text-center">
                    Click to upload
                    <p className="text-sm font-normal">
                      {imageUrls.length} of {maxImages} images uploaded
                      <br />
                      {remainingSlots > 0 && (
                        <span className="text-red-500">
                          You must upload {remainingSlots} more {remainingSlots === 1 ? "image" : "images"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            }}
          </CldUploadWidget>
        ) : (
          <div className="text-green-500 text-sm font-medium">
            Maximum number of images ({maxImages}) reached
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;