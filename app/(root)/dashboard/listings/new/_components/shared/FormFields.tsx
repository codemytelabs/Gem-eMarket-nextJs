"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export const inputClass =
  "w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60";

export const labelClass =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  name?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({
  label,
  required,
  hint,
  name,
  error,
  children,
}: FieldProps) {
  const content =
    error && React.isValidElement<{ className?: string }>(children)
      ? React.cloneElement(children, {
          className: [
            children.props.className ?? "",
            "border-red-500 focus:ring-red-500",
          ]
            .filter(Boolean)
            .join(" "),
        })
      : children;

  return (
    <div id={name ? `field-${name}` : undefined}>
      <label className={labelClass}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {content}
      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input className={`${inputClass} ${className}`} {...rest} />;
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className = "", ...rest } = props;
  return (
    <textarea className={`${inputClass} resize-none ${className}`} {...rest} />
  );
}

export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  const { className = "", ...rest } = props;
  return (
    <div className="relative">
      <select
        className={`${inputClass} appearance-none pr-9 ${className}`}
        {...rest}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        {hint && (
          <span className="block text-xs text-gray-400 mt-0.5">{hint}</span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
          checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
