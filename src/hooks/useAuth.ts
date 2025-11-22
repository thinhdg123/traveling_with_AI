'use client';

import { useEffect, useState } from 'react';
import { auth } from '../../firebase/clientApp';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Pre-compile home page immediately when app loads
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.prefetch('/home');
    }, 500); // Small delay to not block initial auth page load

    return () => clearTimeout(timeoutId);
  }, [router]);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second timeout

    const unsubscribe = auth.onAuthStateChanged((authUser: User | null) => {
      setUser(authUser);
      setLoading(false);
      clearTimeout(timeoutId);

      // Redirect logic based on authentication status
      if (authUser) {
        // User is authenticated, redirect to /home only if on auth or root page
        if (window.location.pathname === '/' || window.location.pathname === '/auth') {
          router.push('/home');
        }
      } else {
        // User is not authenticated, stay on auth page or redirect to it
        if (window.location.pathname !== '/' && window.location.pathname !== '/auth') {
          router.push('/auth');
        }
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [router]);

  return { user, loading };
};
