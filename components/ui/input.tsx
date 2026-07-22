"use client";

import React, { forwardRef } from "react";

type InputSize = "sm" | "md" | "lg";
type InputVariant = "default" | "filled" | "outline";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorText?: string;
  sizeVariant?: InputSize;
  variant?: InputVariant;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error = false,
      errorText,
      sizeVariant = "md",
      variant = "default",
      fullWidth = false,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      className = "",
      containerClassName = "",
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "block w-full rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50";

    const sizeClasses = {
      sm: "py-1 px-3 text-xs",
      md: "py-2 px-4 text-sm",
      lg: "py-3 px-6 text-base",
    };

    const variantClasses = {
      default:
        "border border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      filled:
        "bg-gray-100 border border-transparent hover:bg-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500",
      outline:
        "bg-transparent border border-gray-300 focus:border-blue-500 focus:ring-blue-500",
    };

    const errorClasses = error
      ? "border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
      : "";

    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

    const iconPadding = leftIcon ? "pl-10" : "";
    const rightIconPadding = rightIcon ? "pr-10" : "";
    const widthClass = fullWidth ? "w-full" : "";

    return (
      <div className={`${widthClass} ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative rounded-md shadow-sm">
          {/* Left Addon (like country code in phone input) */}
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 flex items-center">
              <span className="px-3 border-r border-gray-300 bg-gray-50 text-gray-500 sm:text-sm rounded-l-md h-full flex items-center">
                {leftAddon}
              </span>
            </div>
          )}

          {/* Left Icon */}
          {leftIcon && !leftAddon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`
            ${baseClasses} 
            ${sizeClasses[sizeVariant]} 
            ${variantClasses[variant]} 
            ${errorClasses} 
            ${disabledClasses} 
            ${iconPadding} 
            ${rightIconPadding} 
            ${leftAddon ? "pl-16" : ""} 
            ${rightAddon ? "pr-16" : ""}
            ${className}
          `}
            disabled={disabled}
            required={required}
            aria-invalid={error ? "true" : "false"}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && !rightAddon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightIcon}
            </div>
          )}

          {/* Right Addon (like unit of measurement) */}
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 flex items-center">
              <span className="px-3 border-l border-gray-300 bg-gray-50 text-gray-500 sm:text-sm rounded-r-md h-full flex items-center">
                {rightAddon}
              </span>
            </div>
          )}
        </div>

        {/* Helper Text / Error Message */}
        {(helperText || (error && errorText)) && (
          <p
            className={`mt-1 text-sm ${error ? "text-red-600" : "text-gray-500"}`}
          >
            {error ? errorText : helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
