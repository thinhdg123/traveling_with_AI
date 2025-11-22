'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import type { RegionId } from '../data/regions';

// Local data for locations
const LOCAL_LOCATIONS = [
  {
    id: '1',
    name: 'Miền Bắc',
    image: '/khuvuc/mien_bac.jpg',
    publicId: 'mbac'
  },
  {
    id: '2',
    name: 'Miền Trung',
    image: '/khuvuc/mien_trung.jpg',
    publicId: 'mtrung',
    path: '/home/mientrung'
  },
  {
    id: '3',
    name: 'Miền Nam',
    image: '/khuvuc/mien_nam.jpeg',
    publicId: 'mnam'
  },
  {
    id: '4',
    name: 'Miền Tây',
    image: '/khuvuc/mien_tay.jpg',
    publicId: 'mtay'
  }
];

interface Location {
  id: string;
  name: string;
  image: string;
  publicId: string;
  path?: string;
}

interface LocationDisplayProps {
  folder: string;
  onRegionSelect?: (regionId: RegionId) => void;
}

export default function LocationDisplay({ folder, onRegionSelect }: LocationDisplayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLocationClick = (location: Location) => {
    if (onRegionSelect) {
      // Map location IDs to RegionIds
      const regionMap: Record<string, RegionId> = {
        '1': 'north',
        '2': 'central',
        '3': 'south',
        '4': 'mekong'
      };

      const regionId = regionMap[location.id];
      if (regionId) {
        onRegionSelect(regionId);
        return;
      }
    }

    if (location.path) {
      router.push(location.path);
    }
  };

  useEffect(() => {
    // Use local data instead of fetching from Cloudinary
    setLoading(true);
    try {
      setLocations(LOCAL_LOCATIONS);
    } catch (error) {
      console.error('Error loading locations:', error);
      setError('Failed to load locations.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter locations based on search
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Content based on loading/error state
  let content;

  if (loading) {
    content = (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải địa điểm...</p>
        </div>
      </div>
    );
  } else if (error) {
    console.warn(error);
    content = (
      <div className="flex-1 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  } else {
    content = (
      <>
        {filteredLocations.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No locations found</div>
        ) : (
          filteredLocations.map((location) => (
            <div
              key={location.id}
              className="group relative w-full h-[90px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all"
              onClick={() => handleLocationClick(location)}
            >
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full z-1">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  style={{ objectPosition: "center" }}
                />
              </div>

              {/* Gradient Overlay */}
              <div
                className="absolute inset-0 z-2 w-full h-full"
                style={{
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 50%)',
                }}
              />

              {/* Location Name */}
              <div className="absolute w-full h-full inset-0 flex justify-center items-center p-3 z-3">
                <h2
                  className="text-xl font-bold text-white text-shadow"
                  style={{
                    color: "white",
                    textShadow: '0 1px 0 rgba(0,0,0)'
                  }}
                >
                  {location.name}
                </h2>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
            </div>
          ))
        )}
      </>
    );
  }

  return (
    <div className="absolute bg-[#FAF8F8] p-[8px] font-sans w-[288px] h-[400px] flex flex-col"
      style={{
        right: "20px",
        top: "25%",
        border: "1px solid black",
        boxShadow: "0 0 10px rgba(255, 255, 255, 0.25)",
        borderRadius: "0.5rem",
        gap: "8px"
      }}
    >
      <div className="w-full flex flex-col gap-3">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute h-full z-10" style={{ right: "5px" }} />
          <input
            type="text"
            placeholder="Tìm kiếm địa điểm..."
            className="w-full pr-[30px] pl-[10px] py-[8px] text-[16px] border border-[#AFAFAF] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Locations List */}
      <div className="flex-1 overflow-y-auto py-2 pr-1"
        style={{
          background: "white",
          borderRadius: "10px",
          border: "1px solid #AFAFAF",
          boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "8px"
        }}
      >
        {content}
      </div>

      {/* Bottom Home Bar Indicator */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-300 rounded-full"></div>
    </div>
  );
}