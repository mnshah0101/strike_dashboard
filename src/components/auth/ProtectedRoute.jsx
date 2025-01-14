'use client'

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthChecking } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthChecking && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthChecking, router]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
} 