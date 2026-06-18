"use client";

import { useState } from "react";
import { X, Phone, MessageSquare, Loader2, ShieldCheck } from "lucide-react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";

interface WindowWithRecaptcha extends Window {
  recaptchaVerifier?: RecaptchaVerifier;
}

interface Props {
  listingId: string;
  listingTitle: string;
}

type Step = "form" | "otp" | "done";

export default function EnquiryModal({ listingId, listingTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [showOtpOption, setShowOtpOption] = useState(false);

  const [form, setForm] = useState({
    buyerName: "",
    buyerPhone: "",
    buyerEmail: "",
    message: "",
    otp: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  // Submit directly without OTP verification
  const submitDirect = async () => {
    if (!form.buyerPhone || !form.buyerName || !form.message) {
      setError("Please fill in name, phone, and message");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          buyerName: form.buyerName,
          buyerPhone: form.buyerPhone,
          buyerEmail: form.buyerEmail || undefined,
          message: form.message,
          // no firebaseIdToken — phone unverified
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send enquiry");
    } finally {
      setLoading(false);
    }
  };

  // Send OTP (optional verification path)
  const sendOtp = async () => {
    if (!form.buyerPhone) {
      setError("Enter your phone number first");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (!(window as WindowWithRecaptcha).recaptchaVerifier) {
        (window as WindowWithRecaptcha).recaptchaVerifier =
          new RecaptchaVerifier(firebaseAuth, "recaptcha-container", {
            size: "invisible",
          });
      }
      const result = await signInWithPhoneNumber(
        firebaseAuth,
        form.buyerPhone.startsWith("+")
          ? form.buyerPhone
          : `+${form.buyerPhone}`,
        (window as WindowWithRecaptcha).recaptchaVerifier,
      );
      setConfirmationResult(result);
      setStep("otp");
    } catch {
      setError("OTP send failed. Submit without verification instead.");
    } finally {
      setLoading(false);
    }
  };

  // Submit with OTP verification
  const submitVerified = async () => {
    if (!form.otp || !confirmationResult) return;
    setLoading(true);
    setError("");
    try {
      const credential = await confirmationResult.confirm(form.otp);
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          buyerName: form.buyerName,
          buyerPhone: form.buyerPhone,
          buyerEmail: form.buyerEmail || undefined,
          message: form.message,
          firebaseIdToken: idToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setOpen(false);
    setStep("form");
    setForm({
      buyerName: "",
      buyerPhone: "",
      buyerEmail: "",
      message: "",
      otp: "",
    });
    setError("");
    setConfirmationResult(null);
    setShowOtpOption(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Contact Seller
      </button>

      <div id="recaptcha-container" />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                {step === "done" ? "Enquiry Sent!" : "Contact Seller"}
              </h2>
              <button
                onClick={reset}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {step === "done" ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Message sent!
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    The seller will contact you at {form.buyerPhone}
                  </p>
                  <button
                    onClick={reset}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
                  >
                    Done
                  </button>
                </div>
              ) : step === "otp" ? (
                <>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      OTP sent to {form.buyerPhone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Enter 6-digit OTP
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="otp"
                      value={form.otp}
                      onChange={handleChange}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                    />
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    onClick={submitVerified}
                    disabled={loading || form.otp.length < 6}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <ShieldCheck className="w-4 h-4" />
                    Verify & Send
                  </button>
                  <button
                    onClick={() => setStep("form")}
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Re:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {listingTitle}
                    </span>
                  </p>

                  {[
                    {
                      name: "buyerName",
                      label: "Your name",
                      placeholder: "John Silva",
                      required: true,
                    },
                    {
                      name: "buyerPhone",
                      label: "Phone (with country code)",
                      placeholder: "+94 77 123 4567",
                      required: true,
                    },
                    {
                      name: "buyerEmail",
                      label: "Email (optional)",
                      placeholder: "john@email.com",
                      required: false,
                    },
                  ].map((f) => (
                    <div key={f.name}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {f.label}{" "}
                        {f.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        name={f.name}
                        value={form[f.name as keyof typeof form]}
                        onChange={handleChange}
                        placeholder={f.placeholder}
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Hi, I'm interested in this gem. Can you share more details about the certificate and availability?"
                      rows={3}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {error && <p className="text-xs text-red-500">{error}</p>}

                  {/* Primary: send without OTP */}
                  <button
                    onClick={submitDirect}
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <MessageSquare className="w-4 h-4" />
                    Send Enquiry
                  </button>

                  {/* Optional: verify phone */}
                  {!showOtpOption ? (
                    <button
                      onClick={() => setShowOtpOption(true)}
                      className="w-full text-xs text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verify my phone number (optional — helps sellers trust
                      you)
                    </button>
                  ) : (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                      <p className="text-xs text-gray-500">
                        Send a one-time code to{" "}
                        {form.buyerPhone || "your phone"} to verify your
                        identity.
                      </p>
                      <button
                        onClick={sendOtp}
                        disabled={loading || !form.buyerPhone}
                        className="w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 disabled:opacity-50 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        {loading && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        <Phone className="w-3.5 h-3.5" />
                        Send OTP
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
