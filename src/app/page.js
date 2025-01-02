"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBearerToken } from "@/utils/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getBearerToken();
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  // Return a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}
