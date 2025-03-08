"use client";

import Image from "next/image";

interface AvatarProps {
  src: string | null | undefined;
  size?: number;
  className?: string;
}

function Avatar({ src, size = 30, className }: AvatarProps) { 
  return (
<Image
      className={`rounded-full ${className || ""}`}
      height={size}
      width={size}
      alt="Avatar"
      src={src || "/images/profile.png"} />
    
  );
}

export default Avatar;
