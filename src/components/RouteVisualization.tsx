import React, { useMemo, useState } from 'react';
import { TourRoute } from '../data/routes';
import { provinces, vietnamViewBox } from '../data/regions';

interface RouteVisualizationProps {
    route: TourRoute;
}

export default function RouteVisualization({ route }: RouteVisualizationProps) {
    const [hoveredStop, setHoveredStop] = useState<string | null>(null);

    // Get unique province IDs from the route stops
    const routeProvinceIds = useMemo(() => {
        const ids = new Set<string>();
        route.stops.forEach(stop => {
            if (stop.provinceId) {
                ids.add(stop.provinceId);
            }
        });
        return ids;
    }, [route]);

    return (
        <div className="w-full h-full relative bg-[#020612]">
            <svg
                viewBox={vietnamViewBox}
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' }}
            >
                <title>{route.name}</title>

                {/* Render all provinces */}
                {provinces.map((province) => {
                    const isRouteProvince = routeProvinceIds.has(province.id);
                    // const isHovered = false; // We could add hover state if needed

                    return (
                        <path
                            key={province.id}
                            d={province.path}
                            fill={isRouteProvince ? '#ef4444' : '#1e293b'} // Red for route, dark blue-grey for others
                            fillOpacity={isRouteProvince ? 0.9 : 0.4}
                            stroke={isRouteProvince ? '#fca5a5' : '#334155'}
                            strokeWidth={isRouteProvince ? 1.5 : 0.5}
                            className="transition-all duration-300 ease-in-out"
                            style={{
                                pointerEvents: 'all', // Allow interaction if we add click handlers later
                                cursor: isRouteProvince ? 'pointer' : 'default'
                            }}
                        />
                    );
                })}

                {/* Render route path if we have SVG coordinates (legacy support or if we add them later) */}
                {/* For now, we mainly rely on province highlighting for the custom route on SVG map */}
            </svg>

            {/* Overlay for route info */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white p-4 rounded-lg border border-white/10 max-w-xs">
                <h3 className="font-bold text-lg text-pink-500 mb-1">{route.name}</h3>
                <p className="text-sm text-gray-300 mb-3">
                    {route.stops.length} stops across Vietnam
                </p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {route.stops.map((stop, idx) => (
                        <div
                            key={idx}
                            className={`text-xs flex items-center gap-2 p-1.5 rounded ${hoveredStop === stop.name ? 'bg-white/10' : ''
                                }`}
                            onMouseEnter={() => setHoveredStop(stop.name)}
                            onMouseLeave={() => setHoveredStop(null)}
                        >
                            <span className="bg-pink-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0">
                                {idx + 1}
                            </span>
                            <span className={stop.provinceId && routeProvinceIds.has(stop.provinceId) ? 'text-white font-medium' : 'text-gray-400'}>
                                {stop.name}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-gray-500 italic">
                    View detailed route on the Google Map to the right
                </div>
            </div>
        </div>
    );
}
