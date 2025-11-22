'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import Loading from './Loading';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Don't redirect while loading

    if (requireAuth && !user) {
      router.push('/auth');
    } else if (!requireAuth && user) {
      router.push('/home');
    }
  }, [user, loading, router, requireAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // If requiring auth and user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null;
  }

  // If not requiring auth and user is authenticated, don't render children
  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
};
