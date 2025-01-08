'use client';

import Image from "next/image";

interface AvatarProps {
  src: string |null |undefined;
}

function Avatar({ src }: AvatarProps) {
  return (
    <Image
      className="rounded-full"
      height={30}
      width={30}
      alt="Avatar"
      src={src || "/images/profile.png"}
    />
  );
}

export default Avatar;
