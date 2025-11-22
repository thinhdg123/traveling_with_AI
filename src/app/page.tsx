'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Default to auth page - useAuth hook will redirect to home if user is authenticated
    router.push('/auth');
  }, [router]);

  // Show minimal loading state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400 mx-auto mb-2"></div>
        <p className="text-gray-600 text-xs">Loading...</p>
      </div>
    </div>
  );
}