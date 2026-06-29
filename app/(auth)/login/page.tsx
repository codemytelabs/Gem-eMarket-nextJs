"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Lock } from "lucide-react";
import { colors } from "@/lib/theme/colors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Different parts of the app link to /login with either ?next= (e.g. the
// navbar's "Sell" link, EnquiryModal, MessageSellerButton) or ?callbackUrl=
// (the proxy.ts middleware redirect) — read both so neither path silently
// drops the user's intended destination.
function getRedirectTarget(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("next") ?? params.get("callbackUrl");
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "google" | "facebook" | null
  >(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;
      const redirectTarget = getRedirectTarget();

      // router.push alone already fetches fresh server data for the
      // destination route — a trailing router.refresh() here would just
      // discard that fetch and re-request the same page a second time.
      if (redirectTarget) {
        router.push(redirectTarget);
      } else if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "SELLER") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
      // Leave loading=true here on purpose: the button stays disabled and
      // spinning until the destination page actually replaces this one,
      // instead of flashing back to its normal state during the navigation
      // gap (the exact "re-enables, then nothing happens for a beat" UX bug).
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSocialSignIn = (provider: "google" | "facebook") => {
    setSocialLoading(provider);
    signIn(provider, { callbackUrl: getRedirectTarget() ?? "/" });
  };

  return (
    <div className="flex bg-[#f5f5f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8 bg-white p-8 rounded-lg shadow-lg">
        {/* Logo and Header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2"
          >
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
              <Image
                src="/images/blue-sapphire-gemstone-free-png.webp"
                alt="Lumevelo"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <span className="font-bold text-2xl text-primary">Lumevelo</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-[#34495e]">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Or
            <br />
            <Link
              href="/register"
              className="font-bold"
              style={{ color: colors.primary.main }}
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email Address"
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Password"
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded"
                style={{ color: colors.primary.main }}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium"
                style={{ color: colors.primary.main }}
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            disabled={socialLoading !== null}
            leftIcon={<Lock className="h-5 w-5" />}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="flex flex-col space-y-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            isLoading={socialLoading === "google"}
            disabled={socialLoading !== null}
            onClick={() => handleSocialSignIn("google")}
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
            Sign in with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            fullWidth
            isLoading={socialLoading === "facebook"}
            disabled={socialLoading !== null}
            onClick={() => handleSocialSignIn("facebook")}
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
            Sign in with Facebook
          </Button>
        </div>
      </div>
    </div>
  );
}
