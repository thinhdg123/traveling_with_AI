import React, { useMemo } from 'react';
import { TourRoute } from '../data/routes';
import { provinces, vietnamViewBox } from '../data/regions';

interface RouteVisualizationProps {
    route: TourRoute;
    onProvinceClick?: (provinceId: string) => void;
    onProvinceHover?: (provinceId: string | null) => void;
}

export default function RouteVisualization({ route, onProvinceClick, onProvinceHover }: RouteVisualizationProps) {
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
                                pointerEvents: 'all',
                                cursor: isRouteProvince ? 'pointer' : 'default'
                            }}
                            onClick={() => {
                                if (isRouteProvince && onProvinceClick) {
                                    onProvinceClick(province.id);
                                }
                            }}
                            onMouseEnter={() => {
                                if (isRouteProvince && onProvinceHover) {
                                    onProvinceHover(province.id);
                                }
                            }}
                            onMouseLeave={() => {
                                if (isRouteProvince && onProvinceHover) {
                                    onProvinceHover(null);
                                }
                            }}
                        />
                    );
                })}
            </svg>
        </div>
    );
}
