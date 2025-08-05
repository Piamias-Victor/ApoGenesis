// src/hooks/useAuth.ts
'use client';

import { useSession } from 'next-auth/react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
    role: session?.user?.role || null,
    pharmacyId: session?.user?.pharmacyId || null,
    pharmacyName: session?.user?.pharmacyName || null,
  };
};