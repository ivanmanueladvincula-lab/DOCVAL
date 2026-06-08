"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";

export default function ResetPasswordContent() {
  const { setError } = useError();
  const router = useRouter();
  const [step, setStep] = useState("otp"); // "otp" or "password"
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(30);

  // get user_id from router state
  const searchParams = useSearchParams();
  const user_id = searchParams.get("user_id");

  // Timer effect for resend OTP button
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrors("");

    if (!otp) {
      setErrors("Please enter the OTP");
      return;
    }

    setIsSubmitting(true);
    try {
      axiosInstance
        .post("/auth/password/verify_otp", {
          otp: otp,
          user_id: user_id,
        })
        .then(() => {
          setError("OTP verified. You can now reset your password.", "success");
          setStep("password");
          setIsSubmitting(false);
        })
        .catch((err) => {
          const message = err.message || err.error || "Invalid OTP";
          console.log("OTP verify error:", err);
          setError(message, "error");
          setIsSubmitting(false);
        });
    } catch (err) {
      setError(err.message || "Failed to verify OTP", "error");
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors("");

    if (!password) {
      setErrors("Please enter your new password");
      return;
    }

    if (!confirmPassword) {
      setErrors("Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      setErrors("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setErrors("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      axiosInstance
        .post("/auth/password/reset", {
          user_id: user_id,
          new_pass: password,
        })
        .then(() => {
          setError("Password reset successful. Please sign in.", "success");
          router.push("/auth/signin");
          setIsSubmitting(false);
        })
        .catch((err) => {
          const message =
            err.message || err.error || "Failed to reset password";
          console.log("Password reset error:", err);
          setError(message, "error");
          setIsSubmitting(false);
        });
    } catch (err) {
      setError(err.message || "Failed to reset password", "error");
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    setIsSubmitting(true);
    try {
      axiosInstance
        .post("/auth/password/resend_otp", { user_id: user_id })
        .then(() => {
          setTimer(30); // Start 30-second timer
          setError("OTP resent to your email.", "success");
          setIsSubmitting(false);
        })
        .catch((err) => {
          setError(err.message || err.error || "Failed to resend OTP", "error");
          setIsSubmitting(false);
          setTimer(0); // Reset timer on error
        });
    } catch (err) {
      setError(err.message || "Failed to resend OTP", "error");
      setIsSubmitting(false);
      setTimer(0); // Reset timer on error
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Background */}
      <div className="hidden lg:flex lg:w-[80%] relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/dict_text.png"
            alt="Watermark"
            width={500}
            height={500}
            className="opacity-10"
          />
        </div>
      </div>

      {/* Right Section - Form Card */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="p-10">
            {/* Top Logo */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <Image src="/dict_logo.png" alt="Logo" width={50} height={50} />
              <Image
                src="/bagong_pilipinas.png"
                alt="Bagong Pilipinas"
                width={50}
                height={50}
              />
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold text-blue-900 tracking-wide">
                DocVal
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                {step === "otp" ? "Verify Your Identity" : "Set New Password"}
              </p>
            </div>

            {/* Error Message */}
            {errors && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {errors}
              </div>
            )}

            {/* OTP Step */}
            {step === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                {/* OTP Input */}
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    One-Time Password
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setErrors("");
                    }}
                    required
                    className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-black"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Check your email for the OTP code
                  </p>
                  <div className="flex justify-center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={resendOtp}
                      disabled={isSubmitting || timer > 0}
                      sx={{ mt: 2 }}
                    >
                      {timer > 0 ? `Resend OTP (${timer}s)` : "Resend OTP"}
                    </Button>
                  </div>
                </div>

                {/* Verify Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="contained"
                  size="large"
                  fullWidth
                  disableElevation
                  loading={isSubmitting}
                >
                  Verify OTP
                </Button>
              </form>
            )}

            {/* Password Reset Step */}
            {step === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                {/* New Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors("");
                    }}
                    required
                    className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-black"
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    At least 8 characters
                  </p>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors("");
                    }}
                    required
                    className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-black"
                    placeholder="Confirm your password"
                  />
                </div>

                {/* Reset Password Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="contained"
                  size="large"
                  fullWidth
                  disableElevation
                  loading={isSubmitting}
                >
                  Reset Password
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
