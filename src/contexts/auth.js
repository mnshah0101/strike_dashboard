'use client';

import { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: isAuthenticated, isLoading: isAuthChecking } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const token = localStorage.getItem('bearerToken');
      if (!token) return false;
      return await authService.validateToken(token);
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const data = await authService.login(credentials);
      localStorage.setItem('bearerToken', data.token);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['auth']);
      router.push('/dashboard');
    },
  });

  const logout = () => {
    localStorage.removeItem('bearerToken');
    queryClient.setQueryData(['auth'], false);
    queryClient.clear();
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthChecking,
        login: loginMutation.mutate,
        logout,
        loginError: loginMutation.error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 