import { regionCities, CityInfo } from '../data/regions';

export interface LocationResult {
    name: string;
    city: string;
    latLng: { lat: number; lng: number };
}

export function findLocationByName(query: string): LocationResult | null {
    const normalizedQuery = query.toLowerCase().trim();

    for (const region of Object.values(regionCities)) {
        for (const city of region) {
            if (city.name.toLowerCase().includes(normalizedQuery) ||
                city.id.toLowerCase().includes(normalizedQuery)) {

                // Parse coordinates from mapQuery
                if (city.mapQuery) {
                    const [lat, lng] = city.mapQuery.split(',').map(Number);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        return {
                            name: city.name,
                            city: city.name,
                            latLng: { lat, lng }
                        };
                    }
                }
            }
        }
    }
    return null;
}
