"use client";

import React from 'react';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <main className="w-full h-full">
        {children}
      </main>
    </div>
  )
}