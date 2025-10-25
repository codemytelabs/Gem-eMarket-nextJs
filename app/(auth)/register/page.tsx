"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { colors } from "@/lib/theme/colors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // registration logic here
    console.log({
      fullName,
      email,
      contact,
      password,
      confirmPassword,
      agreeTerms,
    });
  };

  return (
    <div className="min-h-screen flex bg-[#f5f5f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8 bg-white p-8 rounded-lg shadow-lg">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.accent.features})`,
              }}
            ></div>
            <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke={colors.primary.main}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-[#34495e]">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Or
            <br />
            <Link
              href="/login"
              className="font-normal"
              style={{ color: colors.primary.main }}
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Full Name"
              id="full-name"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
            />

            <Input
              label="Email Address"
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />

            <Input
              label="Contact"
              id="contact"
              name="contact"
              type="tel"
              autoComplete="contact"
              required
              placeholder="Enter your contact number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              fullWidth
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Create a password"
              helperText="Password must be at least 8 characters with a number and special character"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              rightIcon={
                showPassword ? (
                  <Eye
                    className="h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <EyeOff
                    className="h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(true)}
                  />
                )
              }
            />

            <Input
              label="Confirm Password"
              id="confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword ? password !== confirmPassword : undefined}
              errorText="Passwords do not match"
              fullWidth
              rightIcon={
                showConfirmPassword ? (
                  <Eye
                    className="h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => {
                      setShowConfirmPassword(false);
                    }}
                  />
                ) : (
                  <EyeOff
                    className="h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => {
                      setShowConfirmPassword(true);
                    }}
                  />
                )
              }
            />
          </div>

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agreeTerms"
              type="checkbox"
              className="h-4 w-4 rounded"
              style={{ color: colors.primary.main }}
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <label
              htmlFor="agree-terms"
              className="ml-2 block text-sm text-gray-900"
            >
              I agree to the{" "}
              <a
                href="#"
                className="font-medium"
                style={{ color: colors.primary.main }}
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="font-medium"
                style={{ color: colors.primary.main }}
              >
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            leftIcon={<UserPlus className="h-5 w-5" />}
            className="bg-blue-600"
            style={{
              backgroundColor: colors.primary.main,
            }}
          >
            Create Account
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign up with</span>
          </div>
        </div>

        {/* Social Registration Buttons */}
        <div className="flex flex-col space-y-3">
          <Button
            variant="outline"
            fullWidth
            leftIcon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            }
          >
            Sign up with Google
          </Button>

          <Button
            variant="outline"
            fullWidth
            leftIcon={
              <svg
                className="h-5 w-5 text-blue-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                  fill="#1877F2"
                />
                <path
                  d="M15.893 14.89l.443-2.89h-2.773v-1.876c0-.79.387-1.562 1.63-1.562h1.26v-2.46s-1.144-.195-2.238-.195c-2.285 0-3.777 1.384-3.777 3.89V12h-2.54v2.89h2.54v6.988a10.1 10.1 0 003.115 0v-6.987h2.33z"
                  fill="white"
                />
              </svg>
            }
          >
            Sign up with Facebook
          </Button>
        </div>
      </div>
    </div>
  );
}
