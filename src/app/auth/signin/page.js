"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useLoading } from "@/helper/LoadingContext";
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
    if (status === "loading") startLoading();
    else stopLoading();
    if (status === "authenticated") router.push("/home");
  }, [status, router, startLoading, stopLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

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
      router.push("/home");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
    setError("");
  };

  return (
    <>
      <div className="min-h-screen flex">

        {/* Left — original DICT background */}
        <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/dict_text.png"
              alt="DICT"
              width={500}
              height={500}
              className="opacity-10"
            />
          </div>
        </div>

        {/* Right — sign in form */}
        <div className="w-full lg:w-[40%] flex items-center justify-center bg-white px-10">
          <div className="w-full max-w-sm">

            {/* Logos */}
            <div className="flex items-center gap-3 mb-8">
              <Image src="/dict_logo.png" alt="DICT" width={44} height={44} />
              <Image src="/bagong_pilipinas.png" alt="Bagong Pilipinas" width={44} height={44} />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-[#0C3272] mb-1">DocVal</h1>
            <p className="text-sm text-gray-500 mb-8">Document Validation System</p>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
                {error}
              </p>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0C3272] focus:border-[#0C3272] text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0C3272] focus:border-[#0C3272] text-gray-900"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || status === "loading"}
                className="w-full py-2.5 bg-[#0C3272] hover:bg-[#0a2a5e] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Links */}
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={() => setCheckEmail(true)}
                className="text-xs text-[#0C3272] hover:underline"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => router.push("/auth/activate")}
                className="text-xs text-[#0C3272] hover:underline"
              >
                Activate Account
              </button>
            </div>

          </div>
        </div>
      </div>

      <CheckEmailDialog open={checkEmail} setOpen={setCheckEmail} />
    </>
  );
}