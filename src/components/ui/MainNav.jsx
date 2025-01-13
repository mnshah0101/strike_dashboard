'use client'
import { Button } from "@/components/ui/button";
import { logout, isAuthenticated } from "@/utils/auth";
import Link from "next/link";
import { useState, useEffect } from "react";

export function MainNav() {
  const [authenticated, setAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setMounted(true);
  }, []);

  // Don't render anything until after hydration
  if (!mounted) {
    return null;
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="font-semibold">Strike Dashboard</div>

        <div className="flex items-center gap-2">
          {authenticated ? (
            <>
              <Link className="hover:text-blue-500" href="/dashboard">Risk</Link>
              <Link className="hover:text-blue-500" href="/dashboard/crud">CRUD</Link>
            </>
          ) : (
            <>
              <span className="text-gray-400">Risk</span>
              <span className="text-gray-400">CRUD</span>
            </>
          )}
        </div>

        {authenticated && (
          <Button
            variant="ghost"
            onClick={logout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}
