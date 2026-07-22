"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Lock, ChevronDown } from "lucide-react";
import { colors } from "@/lib/theme/colors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthMethodSwitch } from "@/components/auth/AuthMethodSwitch";
import { COUNTRIES, getDialCode } from "@/lib/utils/countries";

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
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("LK");
  const [dialCode, setDialCode] = useState("+94");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = getDialCode(country);
    if (code) setDialCode(code);
  }, [country]);

  const handleMethodChange = (next: "email" | "phone") => {
    setMethod(next);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const identifier = method === "email" ? email : `${dialCode} ${phoneLocal}`;

    try {
      const result = await signIn("credentials", {
        identifier,
        method,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          method === "email"
            ? "Invalid email or password"
            : "Invalid phone number or password",
        );
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

          <AuthMethodSwitch value={method} onChange={handleMethodChange} />

          <div className="space-y-4">
            {method === "email" ? (
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
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="h-full appearance-none border border-gray-300 rounded-lg pl-3 pr-8 py-2.5 text-sm bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.dialCode}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    value={phoneLocal}
                    onChange={(e) =>
                      setPhoneLocal(e.target.value.replace(/[^0-9\s\-()]/g, ""))
                    }
                    placeholder="77 123 4567"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

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
            leftIcon={<Lock className="h-5 w-5" />}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
