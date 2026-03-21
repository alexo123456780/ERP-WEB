'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = authService.getUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    router.push('/dashboard');
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, logout };
}
