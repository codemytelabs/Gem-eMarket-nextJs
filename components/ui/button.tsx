"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "relative font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 flex items-center justify-center";

  const sizeClasses = {
    sm: "py-1 px-3 text-xs",
    md: "py-2 px-4 text-sm",
    lg: "py-3 px-6 text-base",
  };

  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary-dark text-white border border-transparent focus:ring-blue-400 dark:focus:ring-primary-light",
    secondary:
      "bg-secondary hover:bg-secondary-dark text-white border border-transparent focus:ring-secondary-light",
    outline:
      "bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/40 text-primary border border-primary focus:ring-primary-light",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const loadingState = isLoading ? "opacity-75 cursor-wait" : "";
  const isDisabled = isLoading || disabled;

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${loadingState} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
