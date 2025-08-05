// src/components/providers/SessionProvider.tsx
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

interface SessionProviderProps {
  readonly children: React.ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
};