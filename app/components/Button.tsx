import { IconType } from "react-icons";

interface ButtonProps {
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // Make onClick optional
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  icon?: IconType;
  black?: boolean;
  type?: "button" | "submit" | "reset";
}

function Button({
  label,
  onClick,
  disabled,
  outline,
  small,
  icon: Icon,
  black,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative disabled:opacity-70 disabled:cursor-not-allowed rounded-lg hover:opacity-80 transition w-full
        ${outline ? "bg-white" : black ? "bg-black" : "bg-rose-500"}
        ${outline ? "border-black" : black ? "border-black" : "border-rose-500"}
        ${outline ? "text-black" : black ? "text-white" : "text-white"}
        ${small ? "py-1" : "py-3"}
        ${small ? "font-light" : "font-semibold"}
        ${small ? "border-[1px]" : "border-2"}`}
    >
      {Icon && <Icon size={24} className="absolute left-4 top-3" />}
      {label}
    </button>
  );
}

export default Button;