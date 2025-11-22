'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import Menu from '@/components/Menu';
import type { RegionId } from '@/data/regions';

// Dynamically import client components with SSR disabled
const LocationDisplay = dynamic(() => import('@/components/LocationDisplay'), {
  ssr: false
});

const VietnamMapExperience = dynamic(() => import('@/components/VietnamMapExperience'), {
  ssr: false
});

const HomePage = () => {
  const [activeRegion, setActiveRegion] = React.useState<RegionId | null>(null);

  return (
    <div className="relative w-full h-screen overflow-auto" style={{
      background: 'radial-gradient(circle at 20% 20%, #1d3d65 0%, #020612 65%)'
    }}>
      {/* Map Container */}
      <div className="w-full h-full">
        <VietnamMapExperience
          activeRegion={activeRegion}
          onRegionSelect={setActiveRegion}
        />
      </div>

      {/* Location Display Sidebar */}
      <LocationDisplay
        folder="home"
        onRegionSelect={setActiveRegion}
      />

      {/* Menu Component */}
      <Menu />
    </div>
  );
};

export default HomePage;