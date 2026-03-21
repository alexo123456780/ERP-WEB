'use client';
import { useState } from 'react';
import { authService } from '../services/auth.service';
import type { Role } from '../lib/permissions';

/** Lee el rol del usuario desde localStorage (síncrono, solo client-side). */
export function useRole(): Role | null {
  const [role] = useState<Role | null>(() => {
    if (typeof window === 'undefined') return null;
    return (authService.getUser()?.role as Role) ?? null;
  });
  return role;
}
