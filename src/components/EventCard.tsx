import React from 'react';
import { ItineraryEvent } from '../types/types';
import { MapPin, Wallet, Bus, X, RefreshCw, CalendarPlus, Phone, Globe, ExternalLink } from 'lucide-react';
import { generateGoogleCalendarLink } from '../utils/dateUtils';

interface EventCardProps {
    event: ItineraryEvent;
    date: string;
    onReject: (id: string) => void;
    onRestore: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, date, onReject, onRestore }) => {
    const isRejected = event.status === 'rejected';

    const handleAddToCalendar = () => {
        const link = generateGoogleCalendarLink(event, date);
        window.open(link, '_blank');
    };

    const openMap = () => {
        if (event.address || event.locationName) {
            const query = encodeURIComponent(event.address || event.locationName);
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
        }
    };

    return (
        // Added !bg-white to ensure card is white regardless of global theme
        <div className={`w-full flex flex-col gap-[10px] p-[10px] transition-all duration-300 ${!isRejected ? 'hover:shadow-md' : ''}`} style={{
            borderRadius: '10px',
            background: isRejected ? '#FCA5A5' : 'white',
            border: isRejected ? '1px solid #EF4444' : '1px solid #E5E7EB',
            opacity: isRejected ? 0.7 : 1,
            boxShadow: 'inset 0 0 4px rgba(0, 0, 0, 0.15)',
        }}>
            <div className='w-full flex flex-row gap-[10px]'>
                {/* Image Placeholder */}
                <div className="h-[50px] w-[50px] flex-shrink-0 overflow-hidden relative group cursor-pointer" onClick={openMap} style={{ borderRadius: '10px' }}>
                    <img
                        src={`https://picsum.photos/seed/${event.id}/200/200`}
                        alt={event.activity}
                        className={`w-full h-full object-cover transition-all ${isRejected ? 'grayscale' : ''}`}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full flex flex-col gap-[5px]">
                    {/* Type */}
                    <div className="flex justify-between items-start">
                        <span
                            className="inline-block px-[8px] py-[2px] capitalize"
                            style={{
                                borderRadius: '5px',
                                fontSize: '13px',
                                fontWeight: 'semibold',
                                // Logic for Background Color
                                backgroundColor:
                                    event.type === 'food' ? '#ffedd5' :       // orange-100
                                        event.type === 'transport' ? '#f3f4f6' :  // gray-100
                                            '#dbeafe',                                // blue-100
                                // Logic for Text Color
                                color:
                                    event.type === 'food' ? '#c2410c' :       // orange-700
                                        event.type === 'transport' ? '#374151' :  // gray-700
                                            '#1d4ed8'                                 // blue-700
                            }}
                        >
                            {event.type}
                        </span>
                        <div>{event.time}</div>
                        {event.endTime && <div >to {event.endTime}</div>}
                    </div>

                    {/* Name */}
                    <h4 className={`text-lg font-bold ${isRejected ? 'text-gray-500 line-through' : '!text-gray-800'}`} style={{ margin: '0' }}>
                        {event.activity}
                    </h4>
                </div>
            </div>

            <div className='w-full flex flex-col gap-[10px]'>
                {/* Address / Location */}
                <div
                    className="flex w-full gap-[5px] cursor-pointer transition-colors group" style={{ fontSize: '14px', color: 'gray', justifyContent: 'center' }}
                    onClick={openMap}
                    title="View on Google Maps"
                >
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                    <span className="line-clamp-1 group-hover:underline decoration-blue-600 underline-offset-2">
                        {event.address || event.locationName}
                    </span>
                </div>

                <p className="text-sm line-clamp-2 mb-3 italic text-[14px]" style={{ margin: '0', color: 'gray' }}>
                    {event.description}
                </p>

                <div className="flex flex-wrap gap-[10px]">
                    <span className="flex items-center justify-center gap-[4px] py-[2px] px-[5px]" style={{ borderRadius: '5px', border: '1px solid #E5E7EB', backgroundColor: '#F0F4F9', color: 'gray', fontSize: '12px' }}>
                        <Wallet className="w-3 h-3 text-green-600" />
                        {event.costEstimate > 0 ? <span className="font-semibold text-gray-700">{event.costEstimate.toLocaleString()} {event.currency}</span> : <span className="text-green-600 font-medium">Free</span>}
                    </span>
                    <span className="flex items-center justify-center gap-[4px] py-[2px] px-[5px]" style={{ borderRadius: '5px', border: '1px solid #E5E7EB', backgroundColor: '#F0F4F9', color: 'gray', fontSize: '12px' }}>
                        <Bus className="w-3 h-3 text-purple-600" />
                        {event.transportDuration} ({event.transportMethod})
                    </span>
                </div>

                {/* Contact Links */}
                <div className="flex flex-row justify-between">
                    <div className="flex gap-[10px] text-[14px]">
                        {event.website && (
                            <a href={event.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline" style={{ textDecoration: 'none' }}>
                                <Globe className="w-[15px] h-[15px] mr-[5px]" /> Website
                            </a>
                        )}
                        {event.phoneNumber && (
                            <a href={`tel:${event.phoneNumber}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline" style={{ textDecoration: 'none' }}>
                                <Phone className="w-[15px] h-[15px] mr-[5px]" /> {event.phoneNumber}
                            </a>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center items-center">
                        {isRejected ? (
                            <button
                                onClick={() => onRestore(event.id)}
                                className="flex items-center justify-center py-[2px] px-[6px]" style={{ fontSize: '14px', color: 'green', fontWeight: 'semibold', backgroundColor: 'white', border: '1px solid green', borderRadius: '5px' }}
                            >
                                <RefreshCw className="w-3 h-3" style={{ fontSize: '14px' }} />
                                Hoàn tác
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => onReject(event.id)}
                                    className="flex items-center justify-center py-[2px] px-[6px]" style={{ fontSize: '14px', color: 'red', fontWeight: 'semibold', backgroundColor: 'white', border: '1px solid red', borderRadius: '5px' }}
                                    title="Bỏ địa điểm này"
                                >
                                    <X className="w-auto h-full" style={{ fontSize: '14px' }} />
                                    Bỏ
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {isRejected && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px] rounded-xl pointer-events-none z-10">
                    <span className="px-[5px] py-[2px] rounded-full" style={{ fontSize: '14px', color: 'red', fontWeight: 'semibold', backgroundColor: 'white', border: '1px solid red', borderRadius: '5px' }}>
                        Đã bỏ
                    </span>
                </div>
            )}
        </div>
    );
};