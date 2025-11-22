// Route configuration for displaying on maps
export interface RouteStop {
    name: string;
    city: string;
    provinceId: string;
    coordinates: [number, number]; // SVG coordinates from Vietnam map
    latLng: { lat: number; lng: number }; // Geographic coordinates for Google Maps
}

export interface TourRoute {
    id: string;
    name: string;
    stops: RouteStop[];
    color: string;
    googleMapsUrl: string;
}

// SVG coordinates (centroid from province shapes)
const CITY_COORDINATES: Record<string, [number, number]> = {
    danang: [548.59, 439.98],
    tthue: [546.11, 419.77],
    khanhhoa: [566.49, 515.86],
};

// Real geographic coordinates for Google Maps
const CITY_LATLNG: Record<string, { lat: number; lng: number }> = {
    danang: { lat: 16.0544, lng: 108.2022 },
    tthue: { lat: 16.4637, lng: 107.5909 },
    khanhhoa: { lat: 12.2388, lng: 109.1967 },
};

export const TOUR_ROUTES: Record<string, TourRoute> = {
};

// Get unique cities from a route
export function getRouteCities(route: TourRoute): RouteStop[] {
    const cityMap = new Map<string, RouteStop>();
    route.stops.forEach(stop => {
        if (!cityMap.has(stop.city)) {
            cityMap.set(stop.city, stop);
        }
    });
    return Array.from(cityMap.values());
}
