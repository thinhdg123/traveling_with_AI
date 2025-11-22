'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface City {
  id: string;
  name: string;
  image: string;
  publicId: string;
  path?: string;
  province?: string;
}

interface LocationDisplayProps {
  folder?: string;
}

export default function LocationDisplay({ folder = 'mientrung_city' }: LocationDisplayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchCities = async (cursor: string | null = null) => {
    if (cursor === null && cities.length > 0) return; // Don't refetch initial load if we already have data

    try {
      if (cursor === null) setLoading(true);
      else setLoadingMore(true);

      setError(null);

      const url = `/api/cloudinary?folder=${encodeURIComponent(folder)}&max_results=6${cursor ? `&next_cursor=${cursor}` : ''}`;
      const response = await fetch(url);
      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', responseText);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch cities');
      }

      let resources = [];
      if (Array.isArray(data.resources)) {
        resources = data.resources;
      } else if (Array.isArray(data.images)) {
        resources = data.images;
      } else if (Array.isArray(data)) {
        resources = data;
      } else {
        console.error('Unexpected API response format:', data);
        throw new Error('Unexpected response format from server');
      }

      interface CloudinaryResource {
        publicId?: string;
        public_id?: string;
        id?: string;
        asset_id?: string;
        url?: string;
        secure_url?: string;
      }

      const formattedCities = resources.map((item: CloudinaryResource) => {
        const name = (item.publicId || item.public_id || '')
          .split('/')
          .pop()
          ?.replace(/_/g, ' ');

        return {
          id: item.id || item.asset_id,
          name: name || 'Unknown City',
          image: item.url || item.secure_url,
          publicId: item.publicId || item.public_id,
          path: `/place/${name?.toLowerCase().replace(/\s+/g, '-')}`,
          province: folder.includes('mientrung') ? 'Miền Trung' : ''
        };
      });

      if (cursor) {
        setCities(prevCities => [...prevCities, ...formattedCities]);
      } else {
        setCities(formattedCities);
      }

      // Update pagination state
      setNextCursor(data.next_cursor || null);
      setHasMore(!!data.next_cursor);
    } catch (err) {
      const error = err as Error;
      console.error('Error loading cities:', error);
      setError(error.message || 'Không thể tải danh sách thành phố. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCities(null);
  }, [folder]);

  // Handle scroll for infinite loading
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      // Trigger load more when user scrolls to 80% of the container
      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        if (nextCursor) {
          fetchCities(nextCursor);
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, hasMore, nextCursor]);

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
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

      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[12px] overflow-y-auto p-[8px]"
        style={{
          background: "white",
          borderRadius: "10px",
          border: "1px solid #AFAFAF",
          boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.15)",
          maxHeight: 'calc(100vh - 200px)',
        }}>
        {filteredCities.map((city) => (
          <div
            key={city.id}
            className="group relative w-full h-[90px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all"
            onClick={() => city.path && router.push(city.path)}
          >
            <div className="absolute inset-0 w-full h-full z-1">
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ objectPosition: "center" }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                }}
              />
            </div>
            <div
              className="absolute inset-0 z-2 w-full h-full"
              style={{
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 50%)',
              }}
            />
            <div className="absolute w-full h-full inset-0 flex justify-center items-center p-3 z-3">
              <h2
                className="text-xl font-bold text-white text-shadow w-full text-center"
                style={{
                  color: "white",
                  textShadow: '0 1px 0 rgba(0,0,0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  margin: 0
                }}
              >
                {city.name}
              </h2>
            </div>
          </div>
        ))}
        {loadingMore && (
          <div className="col-span-full flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}