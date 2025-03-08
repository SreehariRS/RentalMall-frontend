'use client';
import React from 'react';

interface MenuItemProps {
  onClick: () => void;
  label: string;
  isBadgeVisible?: boolean;
}

function MenuItem({ onClick, label, isBadgeVisible }: MenuItemProps) {
  return (
    <div
      onClick={onClick}
      className="px-4 py-3 hover:bg-neutral-100 transition font-semibold flex items-center justify-between"
    >
      <span>{label}</span>
      {isBadgeVisible && (
        <span className="h-2.5 w-2.5 bg-red-500 rounded-full" />
      )}
    </div>
  );
}

export default MenuItem;
