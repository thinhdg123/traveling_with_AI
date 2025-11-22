'use client';

import React, { useCallback, useState, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { TourRoute } from '../data/routes';
import { CityInfo, RegionId } from '../data/regions';

interface GoogleMapComponentProps {
    route?: TourRoute;
    showRoute: boolean;
    searchQuery?: string;
    selectedCity?: CityInfo | null;
    activeRegion?: RegionId | null;
    center?: { lat: number; lng: number };
    zoom?: number;
}

const containerStyle = {
    width: '100%',
    height: '100%',
};

// Default center (Vietnam)
const defaultCenter = {
    lat: 14.0583,
    lng: 108.2772,
};

// Region centers for zooming
const REGION_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
    north: { lat: 21.0285, lng: 105.8542, zoom: 8 }, // Hanoi area
    central: { lat: 16.0544, lng: 108.2022, zoom: 8 }, // Da Nang area
    south: { lat: 10.8231, lng: 106.6297, zoom: 9 }, // Ho Chi Minh area
    mekong: { lat: 10.0452, lng: 105.7469, zoom: 9 }, // Mekong Delta
};

export default function GoogleMapComponent({
    route,
    showRoute,
    searchQuery,
    selectedCity,
    activeRegion,
    center,
    zoom = 6,
}: GoogleMapComponentProps) {
    const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Calculate map center and zoom based on selection
    const { mapCenter, mapZoom } = useMemo(() => {
        // Priority 1: Show route if active
        if (showRoute && route) {
            return {
                mapCenter: { lat: 14.5, lng: 108.5 }, // Center of Central Coast
                mapZoom: 8,
            };
        }

        // Priority 2: Selected city
        if (selectedCity) {
            // Try to parse coordinates from mapQuery
            if (selectedCity.mapQuery) {
                const coords = selectedCity.mapQuery.split(',').map(Number);
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    return {
                        mapCenter: { lat: coords[0], lng: coords[1] },
                        mapZoom: 12,
                    };
                }
            }
            // Fallback: use region center if no valid coordinates
            if (activeRegion && REGION_CENTERS[activeRegion]) {
                return {
                    mapCenter: REGION_CENTERS[activeRegion],
                    mapZoom: 10,
                };
            }
        }

        // Priority 3: Active region
        if (activeRegion && REGION_CENTERS[activeRegion]) {
            return {
                mapCenter: REGION_CENTERS[activeRegion],
                mapZoom: REGION_CENTERS[activeRegion].zoom,
            };
        }

        // Priority 4: Custom center/zoom
        if (center) {
            return { mapCenter: center, mapZoom: zoom };
        }

        // Default: Vietnam overview
        return { mapCenter: defaultCenter, mapZoom: 6 };
    }, [showRoute, route, selectedCity, activeRegion, center, zoom]);

    // Get markers from route if showing route
    const markers = showRoute && route ? route.stops : [];

    // Create path for polyline (connecting lines between stops)
    const path = showRoute && route
        ? route.stops.map(stop => stop.latLng)
        : [];

    // Polyline options
    const polylineOptions = {
        strokeColor: '#ef4444',
        strokeOpacity: 1,
        strokeWeight: 4,
        geodesic: true,
    };

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={mapZoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
            }}
        >
            {/* Route polyline */}
            {showRoute && path.length > 1 && (
                <Polyline
                    path={path}
                    options={polylineOptions}
                />
            )}

            {/* Markers for each stop */}
            {markers.map((stop, index) => (
                <Marker
                    key={`${stop.name}-${index}`}
                    position={stop.latLng}
                    onClick={() => setSelectedMarker(index)}
                    label={{
                        text: `${index + 1}`,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                    }}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 12,
                        fillColor: '#ef4444',
                        fillOpacity: 1,
                        strokeColor: 'white',
                        strokeWeight: 3,
                    }}
                >
                    {selectedMarker === index && (
                        <InfoWindow
                            position={stop.latLng}
                            onCloseClick={() => setSelectedMarker(null)}
                        >
                            <div className="p-2">
                                <h3 className="font-bold text-sm">{stop.name}</h3>
                                <p className="text-xs text-gray-600">{stop.city}</p>
                            </div>
                        </InfoWindow>
                    )}
                </Marker>
            ))}
        </GoogleMap>
    );
}
