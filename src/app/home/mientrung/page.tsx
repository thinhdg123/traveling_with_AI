'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import Menu from '@/components/Menu_city';

// Dynamically import client components with SSR disabled
const CityDisplay = dynamic(() => import('@/components/CityDisplay'), { 
  ssr: false 
});

const MientrungPage = () => {
  return (
    <div className="flex-1 h-full overflow-auto">
      <CityDisplay folder="mientrung_city"/>
      {/* Menu Component */}
      <Menu />
    </div>
  );
};

export default MientrungPage;