'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Don't render anything until after hydration
  if (!mounted) {
    return null;
  }

  // After hydration, show loading state if not authenticated
  if (!isAuthenticated()) {
    return (
      <main className="p-4">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </main>
    );
  }

  return children;
} 