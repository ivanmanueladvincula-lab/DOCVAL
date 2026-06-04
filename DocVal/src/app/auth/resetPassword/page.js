"use client";
import { Suspense } from "react";
import ResetPasswordContent from "./ResetPasswordContent";

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
