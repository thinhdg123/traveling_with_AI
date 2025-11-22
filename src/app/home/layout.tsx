"use client";

import React from 'react';
import { AuthGuard } from '../../components/AuthGuard';
import dynamic from 'next/dynamic';
import Loading from '../../components/Loading';
import { Roboto } from 'next/font/google'

const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] })

// Dynamically import TravelPlanner to avoid compilation during auth checks
const TravelPlanner = dynamic(() => import('../../components/TravelPlanner'), {
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <Loading />
    </div>
  ),
  ssr: false
})

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true}>
      <div className={`${roboto.className} flex h-screen`}>
        <div className="w-[30%] h-full overflow-auto">
          <TravelPlanner />
        </div>
        <main className="w-[70%] h-full overflow-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}