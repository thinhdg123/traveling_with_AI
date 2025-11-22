'use client';

import React, { Suspense } from 'react';
import VungMienLayout from '../app/home/layout';
import dynamic from 'next/dynamic';

// Dynamically import the page component with error boundary
const VungMienPage = dynamic(() => import('../app/home/page'), {
  loading: () => <div className="flex items-center justify-center h-full">Loading page...</div>,
  ssr: false
});

// Error boundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in VungMienPage:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="mb-4">We&apos;re having trouble loading the page. Please try refreshing.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const UserRoute = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <VungMienLayout>
          <VungMienPage />
        </VungMienLayout>
      </Suspense>
    </ErrorBoundary>
  );
};

export default UserRoute;