'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function MainNav() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="font-semibold">Strike Dashboard</div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link className="hover:text-blue-500" href="/dashboard">Risk</Link>
              <Link className="hover:text-blue-500" href="/dashboard/crud">CRUD</Link>
              <Button onClick={logout} variant="ghost">Logout</Button>
            </>
          ) : (
            <>
              <span className="text-gray-400">Risk</span>
              <span className="text-gray-400">CRUD</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
