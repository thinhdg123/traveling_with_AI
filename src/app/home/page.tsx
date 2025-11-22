'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const VietnamMapWindow = dynamic(() => import('@/components/VietnamMapWindow'), {
  ssr: false
});

const HomePage = () => {
  return (
    <div className="w-full h-screen">
      <VietnamMapWindow />
    </div>
  );
};

export default HomePage;