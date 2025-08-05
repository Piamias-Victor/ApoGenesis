// src/types/auth.ts
import type { DefaultSession } from 'next-auth';

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: 'pharmacien' | 'admin';
  readonly pharmacyId: string | null;
  readonly pharmacyName: string | null;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'pharmacien' | 'admin';
      pharmacyId: string | null;
      pharmacyName: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'pharmacien' | 'admin';
    pharmacyId: string | null;
    pharmacyName: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'pharmacien' | 'admin';
    pharmacyId: string | null;
    pharmacyName: string | null;
  }
}