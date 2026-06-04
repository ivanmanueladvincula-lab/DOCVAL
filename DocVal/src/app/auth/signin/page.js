"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { useLoading } from "@/helper/LoadingContext";
import { Button } from "@mui/material";
import CheckEmailDialog from "./components/CheckEmailDialog";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (status === "loading") {
      startLoading();
    } else {
      stopLoading();
    }

    if (status === "authenticated") {
      router.push("/home");
    } else if (status === "unauthenticated") {
      // stay on the page
    }
  }, [status, router, startLoading, stopLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    // console.log("Submitting:", { email, password });
    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/home",
      redirect: false,
    });

    if (!result.ok) {
      setError(result.error || "Failed to sign in. Please try again.");
      setIsSubmitting(false);
    } else {
      // console.log("Sign in successful:", result);
      router.push("/home");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
    setError("");
  };

  return (
    <>
      <div className="min-h-screen flex">
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

        {/* Right Section - Login Card */}
        <div className="w-full lg:w-[40%] flex items-center justify-center p-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="w-full max-w-md">
            {/* Login Card */}
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
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-black"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-black"
                    placeholder="Enter your password"
                  />
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || status == "loading"}
                  variant="contained"
                  size="large"
                  fullWidth
                  loading={isSubmitting}
                  disableElevation
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setCheckEmail(true)}
                >
                  Forgot Password?
                </Button>
                        <Button
          variant="text"
          size="small"
          onClick={() => router.push("/auth/activate")}
        >
          Activate Account
        </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <CheckEmailDialog open={checkEmail} setOpen={setCheckEmail} />
    </>
  );
}
