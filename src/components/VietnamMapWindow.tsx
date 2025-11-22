import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import type { CityInfo, RegionDefinition, RegionId } from '../data/regions';
import { provinces, regionCities, regions, vietnamViewBox } from '../data/regions';
import { TOUR_ROUTES } from '../data/routes';
import RouteVisualization from './RouteVisualization';
import GoogleMapComponent from './GoogleMapComponent';
import { LocationResult } from '../utils/locationUtils';
import { TourRoute } from '../data/routes';
import { normalizeProvinceName } from '../utils/provinceMapping';

const LIBRARIES: ("places")[] = ["places"];

const parseViewBox = (viewBox: string): { minX: number; minY: number; width: number; height: number } => {
    const [minX, minY, width, height] = viewBox.split(' ').map(Number);
    return { minX, minY, width, height };
};

const getOverlayStyle = (
    point: [number, number],
    viewBoxMeta: ReturnType<typeof parseViewBox>
) => {
    const left = ((point[0] - viewBoxMeta.minX) / viewBoxMeta.width) * 100;
    const top = ((point[1] - viewBoxMeta.minY) / viewBoxMeta.height) * 100;
    return {
        left: `${left}%`,
        top: `${top}%`,
    };
};

const regionLookup: Record<RegionId, RegionDefinition> = regions.reduce(
    (acc, region) => {
        acc[region.id] = region;
        return acc;
    },
    {} as Record<RegionId, RegionDefinition>
);

const citiesByProvince = (() => {
    const lookup = new Map<string, CityInfo>();
    Object.values(regionCities).forEach((cityList) => {
        cityList.forEach((city) => {
            lookup.set(city.provinceId, city);
        });
    });
    return lookup;
})();

interface VietnamMapWindowProps {
    className?: string;
    style?: React.CSSProperties;
}

export default function VietnamMapWindow({ className, style }: VietnamMapWindowProps) {
    const [activeRegion, setActiveRegion] = useState<RegionId | null>(null);
    const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);
    const [selectedCity, setSelectedCity] = useState<CityInfo | null>(null);
    const [hoveredCity, setHoveredCity] = useState<CityInfo | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showSearchBar, setShowSearchBar] = useState(true);
    const [showRoute, setShowRoute] = useState(false);
    const [isPopupDimmed, setIsPopupDimmed] = useState(false);
    const selectedPopupRef = useRef<HTMLDivElement>(null);
    const [customRouteStops, setCustomRouteStops] = useState<LocationResult[]>([]);
    const [isCreatingRoute, setIsCreatingRoute] = useState(false);
    const [customRoute, setCustomRoute] = useState<TourRoute | undefined>(undefined);

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const vietnamView = useMemo(() => parseViewBox(vietnamViewBox), []);
    const provinceLookup = useMemo(() => {
        const map = new Map<string, (typeof provinces)[number]>();
        provinces.forEach((province) => {
            map.set(province.id, province);
        });
        return map;
    }, []);

    useEffect(() => {
        setSelectedCity(null);
        setShowRoute(false);
    }, [activeRegion]);

    useEffect(() => {
        if (!selectedCity) {
            setIsPopupDimmed(false);
            return;
        }
        const handleMouseMove = (e: MouseEvent) => {
            if (selectedPopupRef.current) {
                const rect = selectedPopupRef.current.getBoundingClientRect();
                const isOver =
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom;
                setIsPopupDimmed(isOver);
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [selectedCity]);

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                let provinceId = '';

                // Try to find province from address components
                if (place.address_components) {
                    for (const component of place.address_components) {
                        if (component.types.includes('administrative_area_level_1')) {
                            const mappedId = normalizeProvinceName(component.long_name);
                            if (mappedId) {
                                provinceId = mappedId;
                                break;
                            }
                        }
                    }
                }

                const newStop: LocationResult = {
                    name: place.name || '',
                    city: place.formatted_address || '',
                    latLng: {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    }
                };

                const stopWithProvince = { ...newStop, provinceId };
                setCustomRouteStops([...customRouteStops, stopWithProvince]);
                setSearchQuery('');
            }
        }
    };

    const handleRemoveStop = (index: number) => {
        const newStops = [...customRouteStops];
        newStops.splice(index, 1);
        setCustomRouteStops(newStops);
    };

    const handleVisualizeRoute = () => {
        if (customRouteStops.length < 2) {
            alert('Please add at least 2 stops to create a route.');
            return;
        }

        const newRoute: TourRoute = {
            id: 'custom-route',
            name: 'Custom Journey',
            color: '#ef4444',
            googleMapsUrl: '',
            stops: customRouteStops.map(stop => ({
                name: stop.name,
                city: stop.city,
                provinceId: (stop as any).provinceId || '',
                coordinates: [0, 0],
                latLng: stop.latLng
            }))
        };

        setCustomRoute(newRoute);
        setShowRoute(true);
    };

    const toggleRouteCreation = () => {
        setIsCreatingRoute(!isCreatingRoute);
        if (!isCreatingRoute) {
            // Reset when opening
            setCustomRouteStops([]);
            setCustomRoute(undefined);
            setShowRoute(false);
        }
    };

    const renderOverview = () => {
        const overviewPaths = provinces.map((province) => {
            const region = regionLookup[province.regionId];
            const dimmed = hoveredRegion && hoveredRegion !== province.regionId;
            return (
                <path
                    key={`overview-${province.id}`}
                    d={province.path}
                    fill={region.color}
                    stroke={region.color}
                    strokeWidth={0.8}
                    opacity={dimmed ? 0.35 : 0.9}
                    className="map-province transition-opacity duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredRegion(province.regionId)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() => {
                        setActiveRegion(province.regionId);
                        setHoveredRegion(null);
                    }}
                />
            );
        });

        return (
            <div className="map-pane map-pane--main relative w-1/3 h-full">
                {showRoute && customRoute ? (
                    <RouteVisualization route={customRoute} />
                ) : (
                    <>
                        <svg viewBox={vietnamViewBox} className="w-full h-full" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' }}>
                            <title>Vietnam map overview</title>
                            {overviewPaths}
                        </svg>
                        {hoveredRegion && regionLookup[hoveredRegion] && (
                            <div
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none bg-black/70 text-white px-2 py-1 rounded text-sm whitespace-nowrap z-10"
                                style={getOverlayStyle(regionLookup[hoveredRegion].labelPosition, vietnamView)}
                            >
                                {regionLookup[hoveredRegion].name}
                            </div>
                        )}
                    </>
                )}

                <div className="absolute bottom-4 right-4 z-10">
                    <button
                        className={`px-4 py-2 rounded-lg shadow-lg font-bold transition-colors ${showRoute
                            ? 'bg-pink-500 text-white hover:bg-pink-600'
                            : 'bg-white text-gray-800 hover:bg-gray-100'
                            }`}
                        onClick={() => setShowRoute(!showRoute)}
                        title="Xem lộ trình tour"
                    >
                        {showRoute ? 'Ẩn Lộ Trình' : 'Xem Lộ Trình'}
                    </button>
                </div>
            </div>
        );
    };

    const renderDetail = () => {
        if (!activeRegion) return null;
        const regionDef = regionLookup[activeRegion];
        const regionViewMeta = parseViewBox(regionDef.viewBox);

        const detailPaths = provinces.map((province) => {
            const inRegion = province.regionId === regionDef.id;
            const cityFromProvince = citiesByProvince.get(province.id);
            const isSelected = selectedCity?.provinceId === province.id;
            const isHovered = hoveredCity?.provinceId === province.id;
            const isDimmed = (hoveredCity || selectedCity) && !isHovered && inRegion && !isSelected;

            return (
                <path
                    key={`detail-${province.id}`}
                    d={province.path}
                    fill={inRegion ? regionDef.color : '#132033'}
                    opacity={isDimmed ? 0.5 : inRegion ? 0.94 : 0.4}
                    stroke={inRegion ? '#041120' : '#03070f'}
                    strokeWidth={inRegion ? (isSelected || isHovered ? 2 : 1) : 0.7}
                    className={`map-province cursor-pointer transition-all duration-200 ${isSelected ? 'is-selected' : ''}`}
                    onMouseEnter={inRegion && cityFromProvince ? () => setHoveredCity(cityFromProvince) : undefined}
                    onMouseLeave={inRegion ? () => setHoveredCity(null) : undefined}
                    onClick={() => {
                        if (inRegion && cityFromProvince) {
                            setSelectedCity(cityFromProvince);
                            setHoveredCity(null);
                        } else if (!inRegion) {
                            setActiveRegion(province.regionId);
                            setHoveredRegion(null);
                        }
                    }}
                />
            );
        });

        return (
            <div className="map-pane map-pane--main relative w-1/3 h-full">
                <button
                    className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white px-4 py-2 rounded-lg transition-colors"
                    onClick={() => setActiveRegion(null)}
                >
                    ← Trở về toàn quốc
                </button>

                {showRoute && customRoute ? (
                    <RouteVisualization route={customRoute} />
                ) : (
                    <>
                        <svg viewBox={regionDef.viewBox} className="w-full h-full">
                            <title>Zoomed view for {regionDef.name}</title>
                            {detailPaths}
                        </svg>

                        {hoveredCity && provinceLookup.get(hoveredCity.provinceId) && hoveredCity.id !== selectedCity?.id && (
                            <div
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none bg-white text-black px-3 py-1 rounded shadow-lg z-20"
                                style={getOverlayStyle(provinceLookup.get(hoveredCity.provinceId)!.centroid, regionViewMeta)}
                            >
                                <p className="font-bold text-sm">{hoveredCity.name}</p>
                            </div>
                        )}

                        {selectedCity && provinceLookup.get(selectedCity.provinceId) && (() => {
                            const regionCenter = {
                                x: regionViewMeta.minX + regionViewMeta.width / 2,
                                y: regionViewMeta.minY + regionViewMeta.height / 2,
                            };
                            const cityCenter = {
                                x: provinceLookup.get(selectedCity.provinceId)!.centroid[0],
                                y: provinceLookup.get(selectedCity.provinceId)!.centroid[1],
                            };
                            const isLeft = cityCenter.x < regionCenter.x;
                            const isTop = cityCenter.y < regionCenter.y;

                            return (
                                <div
                                    ref={selectedPopupRef}
                                    className="absolute bg-white text-black px-4 py-2 rounded-lg shadow-xl z-20 transition-opacity duration-300"
                                    style={{
                                        opacity: isPopupDimmed ? 0.4 : 1,
                                        left: isLeft ? '55%' : 'auto',
                                        right: isLeft ? 'auto' : '55%',
                                        top: isTop ? '55%' : 'auto',
                                        bottom: isTop ? 'auto' : '55%',
                                        maxWidth: '220px',
                                    }}
                                >
                                    <p className="font-bold text-lg">{selectedCity.name}</p>
                                </div>
                            );
                        })()}
                    </>
                )}

                <div className="absolute bottom-4 right-4 z-10">
                    <button
                        className={`px-4 py-2 rounded-lg shadow-lg font-bold transition-colors ${showRoute
                            ? 'bg-pink-500 text-white hover:bg-pink-600'
                            : 'bg-white text-gray-800 hover:bg-gray-100'
                            }`}
                        onClick={() => setShowRoute(!showRoute)}
                        title="Xem lộ trình tour"
                    >
                        {showRoute ? 'Ẩn Lộ Trình' : 'Xem Lộ Trình'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} libraries={LIBRARIES}>
            <div className={`relative w-full h-full flex overflow-hidden bg-[#020612] ${className}`} style={style}>
                {showSearchBar ? (
                    <div className="absolute top-4 right-4 z-50 w-[288px] bg-[#FAF8F8] p-2 rounded-lg shadow-lg border border-black">
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                            onClick={() => setShowSearchBar(false)}
                            aria-label="Hide search bar"
                        >
                            <X size={18} />
                        </button>
                        <div className="relative w-full mt-6">
                            <Search className="absolute h-full z-10 right-2 top-0 text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm địa điểm..."
                                className="w-full pr-8 pl-3 py-2 text-base border border-[#AFAFAF] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                ) : (
                    <button
                        className="absolute top-4 right-4 z-50 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors border border-gray-200"
                        onClick={() => setShowSearchBar(true)}
                        title="Hiện thanh tìm kiếm"
                    >
                        <Search size={20} className="text-gray-600" />
                    </button>
                )}

                {/* Custom Route Builder Panel */}
                {isCreatingRoute && (
                    <div className="absolute top-20 right-4 z-40 w-[300px] bg-white p-4 rounded-lg shadow-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-800">Create Your Route</h3>
                            <button onClick={toggleRouteCreation} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <Autocomplete
                                onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
                                onPlaceChanged={onPlaceChanged}
                            >
                                <input
                                    type="text"
                                    placeholder="Search tourist location..."
                                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </Autocomplete>
                        </div>

                        <div className="max-h-[200px] overflow-y-auto mb-4 space-y-2">
                            {customRouteStops.map((stop, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {index + 1}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">{stop.name}</span>
                                            <span className="text-xs text-gray-500 truncate max-w-[180px]">{stop.city}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveStop(index)}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {customRouteStops.length === 0 && (
                                <p className="text-gray-400 text-sm text-center italic">Search to add stops</p>
                            )}
                        </div>

                        <button
                            onClick={handleVisualizeRoute}
                            disabled={customRouteStops.length < 2}
                            className={`w-full py-2 rounded-md font-bold text-white transition-colors ${customRouteStops.length >= 2
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-300 cursor-not-allowed'
                                }`}
                        >
                            Visualize Route
                        </button>
                    </div>
                )}
                <div className="flex w-full h-full">
                    {activeRegion ? renderDetail() : renderOverview()}

                    <div className="w-2/3 h-full bg-gray-900 border-l border-gray-800 relative">
                        <GoogleMapComponent
                            route={customRoute}
                            showRoute={showRoute}
                            searchQuery={searchQuery}
                            selectedCity={selectedCity}
                            activeRegion={activeRegion}
                            zoom={showRoute ? 8 : 6}
                        />

                        {/* Toggle Button for Route Builder */}
                        {!isCreatingRoute && (
                            <button
                                onClick={toggleRouteCreation}
                                className="absolute top-4 left-4 z-10 bg-white text-blue-600 px-4 py-2 rounded-lg shadow-lg font-bold hover:bg-blue-50 transition-colors border border-blue-100"
                            >
                                + Create Custom Route
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </LoadScript>
    );
}
