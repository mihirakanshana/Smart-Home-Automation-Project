import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { subscribeAuthState, loginUser, signupUser, signInGuest, logoutUser, resetPassword } from '../firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeAuthState((u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, pass: string) => {
    setError(null);
    try {
      const u = await loginUser(email, pass);
      setUser(u);
      return u;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      throw err;
    }
  };

  const handleSignup = async (email: string, pass: string, name?: string) => {
    setError(null);
    try {
      const u = await signupUser(email, pass, name);
      setUser(u);
      return u;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
      throw err;
    }
  };

  const handleGuest = async () => {
    setError(null);
    try {
      const u = await signInGuest();
      setUser(u);
      return u;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Guest access failed';
      setError(message);
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to logout';
      setError(message);
    }
  };

  const handleResetPassword = async (email: string) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send password reset email';
      setError(message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    login: handleLogin,
    signup: handleSignup,
    loginGuest: handleGuest,
    logout: handleLogout,
    resetPassword: handleResetPassword,
    clearError: () => setError(null),
  };
}
