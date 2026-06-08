"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useLoading } from "@/helper/LoadingContext";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    if (status === "loading") {
      startLoading();
    } else {
      stopLoading();
    }

    if (status === "authenticated") {
      router.push("/home");
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router, startLoading, stopLoading]);

  // Should not reach here as we redirect above
  return null;
}
