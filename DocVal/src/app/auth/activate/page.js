"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axiosInstance from "@/helper/Axios";
import { useError } from "@/helper/ErrorContext";

export default function ActivatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setError } = useError();
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    const otpFromUrl = searchParams.get("otp");
    setFormData((prev) => ({
      ...prev,
      email: emailFromUrl || "",
      otp: otpFromUrl || "",
    }));
  }, [searchParams]);

  // ✅ Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.otp.trim()) newErrors.otp = "OTP is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    axiosInstance
      .post("/auth/activate", {
        email: formData.email,
        otp: formData.otp,
        password: formData.password,
      })
      .then(() => {
        setError("Account activated successfully! You can now log in.", "success");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      })
      .catch((err) => {
        setError(err.message || "Activation failed. Please try again.", "error");
        setLoading(false);
      });
  };

  // ✅ Resend OTP handler
  const handleResendOtp = () => {
    if (!formData.email) {
      setError("Email is required to resend OTP", "warning");
      return;
    }
    setResendLoading(true);
    axiosInstance
      .post("/auth/activate/resend_otp", { email: formData.email })
      .then(() => {
        setError("OTP sent! Check your email.", "success");
        setCountdown(60);
        setResendLoading(false);
        // ✅ Clear OTP field so user types new one
        setFormData((prev) => ({ ...prev, otp: "" }));
      })
      .catch((err) => {
        setError(err.message || "Failed to resend OTP.", "error");
        setResendLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
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

      {/* Right Section */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="w-full max-w-md">
          <div className="p-10">
            {/* Logo */}
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
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Activate your account
              </Typography>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  fullWidth
                  variant="outlined"
                  size="small"
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={loading || !!searchParams.get("email")}
                />

                <TextField
                  label="OTP Code"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit OTP from your email"
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ maxLength: 6 }}
                  error={!!errors.otp}
                  helperText={errors.otp}
                  disabled={loading}
                />

                {/* ✅ Resend OTP button with timer */}
                <div style={{ textAlign: "right", marginTop: "-12px" }}>
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleResendOtp}
                    disabled={resendLoading || countdown > 0 || loading}
                  >
                    {resendLoading ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={12} color="inherit" />
                        <span>Sending...</span>
                      </Stack>
                    ) : countdown > 0 ? (
                      `Resend OTP in ${countdown}s`
                    ) : (
                      "Resend OTP"
                    )}
                  </Button>
                </div>

                <TextField
                  label="New Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="At least 8 characters"
                  fullWidth
                  variant="outlined"
                  size="small"
                  required
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={loading}
                />

                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter your password"
                  fullWidth
                  variant="outlined"
                  size="small"
                  required
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={loading}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  disableElevation
                >
                  {loading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={16} color="inherit" />
                      <span>Activating...</span>
                    </Stack>
                  ) : (
                    "Activate Account"
                  )}
                </Button>

                <Button
                  variant="text"
                  size="small"
                  onClick={() => router.push("/auth/signin")}
                  disabled={loading}
                >
                  Back to Sign In
                </Button>
              </Stack>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}