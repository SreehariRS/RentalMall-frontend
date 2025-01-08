"use client";

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useCallback } from "react";
import { FcOldTimeCamera } from "react-icons/fc";

declare global {
  var cloudinary: any;
}

interface ImageUploadProps {
  onChange: (value: string) => void;
  value: string;
}

function ImageUpload({ onChange, value }: ImageUploadProps) {
  console.log(value);

  const handleUpload = useCallback(
    (result: any) => {
      console.log("Uploaded Image Result:", result);
      onChange(result.info.secure_url);
    },
    [onChange]
  );

  return (
    <CldUploadWidget
      onSuccess={handleUpload}
      uploadPreset="Rental"
      options={{
        maxFiles: 1,
      }}
    >
      {({ open }) => (
        <div
          onClick={() => {
            console.log("Opening Cloudinary Widget");
            open?.();
          }}
          className="relative cursor-pointer hover:opacity-70 transition border-dashed border-2 border-neutral-300 flex flex-col justify-center items-center gap-4 text-neutral-600 p-4"
        >
          <FcOldTimeCamera size={50} />
          <div className="font-semibold text-lg">Click to upload</div>
          {value && (
            <div className="relative w-full h-64 overflow-hidden">
              <Image
                alt="Uploaded Image"
                src={value}
                layout="fill" 
                objectFit="cover" 
                className="absolute inset-0" 
              />
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
}

export default ImageUpload;
