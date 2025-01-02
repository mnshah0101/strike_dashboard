'use client'
import { Button } from "@/components/ui/button";
import { logout } from "@/utils/auth";
import Link from "next/link";
export function MainNav() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="font-semibold">Strike Dashboard</div>

        <div className="flex items-center gap-2">
            <Link className="hover:text-blue-500 "  href="/dashboard">Risk</Link>
            <Link className="hover:text-blue-500" href="/dashboard/crud">CRUD</Link>
        </div>


        <Button
          variant="ghost"
          onClick={logout}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
