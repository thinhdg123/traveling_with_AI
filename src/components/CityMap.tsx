import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import {
    Camera,
    Utensils,
    Coffee,
    Bed,
    ShoppingBag,
    Info,
    Mountain,
    Landmark,
    Star,
    MapPin,
    Clock,
    Trees,
    Palmtree,
    ExternalLink,
} from 'lucide-react'
import type { CityDetail, POICategory } from '../data/cityDetails'

interface CityMapProps {
    cityId: string
    details: CityDetail
}

const CATEGORY_CONFIG: Record<
    POICategory,
    { color: string; icon: React.ElementType; label: string }
> = {
    sightseeing: { color: '#3b82f6', icon: Camera, label: 'Sightseeing' },
    mountain: { color: '#10b981', icon: Mountain, label: 'Mountain' },
    beach: { color: '#0ea5e9', icon: Palmtree, label: 'Beach' },
    forest: { color: '#15803d', icon: Trees, label: 'Forest' },
    culture: { color: '#8b5cf6', icon: Landmark, label: 'Culture' },
    food: { color: '#f97316', icon: Utensils, label: 'Food' },
    drink: { color: '#eab308', icon: Coffee, label: 'Drink' },
    stay: { color: '#06b6d4', icon: Bed, label: 'Stay' },
    shopping: { color: '#ec4899', icon: ShoppingBag, label: 'Shopping' },
    services: { color: '#6b7280', icon: Info, label: 'Services' },
}

const createCustomIcon = (type: POICategory) => {
    const config = CATEGORY_CONFIG[type]
    const iconMarkup = renderToStaticMarkup(
        <div
            style={{
                backgroundColor: config.color,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            }}
        >
            <config.icon color="white" size={18} />
        </div>
    )

    return L.divIcon({
        html: iconMarkup,
        className: 'custom-marker-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    })
}

const CityMap = ({ details }: CityMapProps) => {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <MapContainer
                key={details.center.join(',')}
                center={details.center}
                zoom={details.zoom}
                style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {details.pois.map((poi, index) => (
                    <Marker key={index} position={[poi.lat, poi.lng]} icon={createCustomIcon(poi.type)}>
                        <Popup maxWidth={320} minWidth={300}>
                            <div style={{ padding: '0.25rem' }}>
                                {poi.images && poi.images.length > 0 && (
                                    <div
                                        style={{
                                            width: 'calc(100% + 41px)', // Leaflet popup padding compensation
                                            height: '160px',
                                            margin: '-21px -21px 12px -21px',
                                            backgroundImage: `url(${poi.images[0]})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            borderRadius: '12px 12px 0 0',
                                        }}
                                    />
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <strong
                                        style={{
                                            display: 'block',
                                            color: '#111827',
                                            fontSize: '1.1rem',
                                            lineHeight: '1.3',
                                            flex: 1,
                                            marginRight: '0.5rem',
                                        }}
                                    >
                                        {poi.name}
                                    </strong>
                                    {
                                        poi.rating && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                                                <Star size={12} fill="#d97706" color="#d97706" />
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e' }}>{poi.rating}</span>
                                                <span style={{ fontSize: '0.7rem', color: '#b45309' }}>({poi.reviews})</span>
                                            </div>
                                        )
                                    }
                                </div >

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '0.75rem',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            color: CATEGORY_CONFIG[poi.type].color,
                                            fontWeight: 700,
                                            backgroundColor: `${CATEGORY_CONFIG[poi.type].color}15`,
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            border: `1px solid ${CATEGORY_CONFIG[poi.type].color}30`
                                        }}
                                    >
                                        {CATEGORY_CONFIG[poi.type].label}
                                    </span>
                                    {poi.priceLevel && (
                                        <span style={{ fontSize: '0.75rem', color: '#4b5563', fontWeight: 600 }}>
                                            {poi.priceLevel}
                                        </span>
                                    )}
                                </div>

                                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#374151', lineHeight: '1.5' }}>
                                    {poi.description}
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }}>
                                    {poi.address && (
                                        <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.8rem', color: '#4b5563' }}>
                                            <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                                            <span>{poi.address}</span>
                                        </div>
                                    )}
                                    {poi.openHours && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#4b5563' }}>
                                            <Clock size={14} style={{ flexShrink: 0 }} />
                                            <span>{poi.openHours}</span>
                                        </div>
                                    )}
                                    {poi.website && (
                                        <a
                                            href={poi.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.85rem',
                                                color: '#2563eb',
                                                textDecoration: 'none',
                                                fontWeight: 500,
                                                marginTop: '0.25rem'
                                            }}
                                        >
                                            <ExternalLink size={14} />
                                            Visit Website
                                        </a>
                                    )}
                                </div>
                            </div >
                        </Popup >
                    </Marker >
                ))}
            </MapContainer >

            {/* Legend */}
            < div
                style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1rem',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    fontSize: '0.75rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem 1rem',
                    border: '1px solid rgba(0,0,0,0.1)',
                }}
            >
                {
                    Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: config.color,
                                }}
                            />
                            <span style={{ color: '#374151', fontWeight: 500 }}>{config.label}</span>
                        </div>
                    ))
                }
            </div >
        </div >
    )
}

export default CityMap
