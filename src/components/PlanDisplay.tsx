'use client';

import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Dashboard } from './Dashboard';
import { EventCard } from './EventCard';
import { TripPlan } from '../types/types';
import { AlertCircle, RefreshCw, Heart, Loader2 } from 'lucide-react';
import Loading from './Loading';

interface PlanDisplayProps {
    tripPlan: TripPlan | null;
    isLoading: boolean;
    error: string | null;
    onReject: (id: string) => void;
    onRestore: (id: string) => void;
    onRegenerate?: () => void;
    isRegenerating?: boolean;
}

export default function PlanDisplay({
    tripPlan,
    isLoading,
    error,
    onReject,
    onRestore,
    onRegenerate,
    isRegenerating = false
}: PlanDisplayProps) {

    // Show error toast when error changes
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const rejectedCount = tripPlan?.itinerary.reduce((acc, day) =>
        acc + day.events.filter(e => e.status === 'rejected').length, 0
    ) || 0;

    return (
        <div className="w-full p-[10px]" style={{ background: '#FAF8F8', border: '1px solid #D5D4DF', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)', borderRadius: "20px" }}>
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 animate-pulse">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <Loading />
                        <span className="text-gray-600 font-medium flex items-center gap-[4px]">
                            Đang suy nghĩ, hãy đợi chút nhé <Heart className="w-[20px] h-[20px] animate-pulse" fill="currentColor" style={{ color: '#FDA4A4' }} />
                        </span>
                    </div>
                </div>
            ) : !tripPlan ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="bg-blue-50 p-4 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-lg">Hãy điền các yêu cầu trên để bắt đầu</p>
                </div>
            ) : (
                <div className="w-full animate-fade-in">
                    <Dashboard
                        stats={tripPlan.stats}
                        tips={tripPlan.tips}
                    />

                    {/* Action Bar for Regenerate */}
                    {rejectedCount > 0 && onRegenerate && (
                        <div className="sticky top-20 z-20 mb-6 !bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-amber-200 flex items-center justify-between animate-slide-in">
                            <div className="flex items-center gap-2 text-amber-800 font-medium">
                                <AlertCircle className="w-5 h-5" />
                                <span>{rejectedCount} events rejected manually</span>
                            </div>
                            <button
                                onClick={onRegenerate}
                                disabled={isRegenerating}
                                className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 flex items-center gap-2 shadow-md disabled:opacity-50 transition-all"
                            >
                                {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                Regenerate Fixes
                            </button>
                        </div>
                    )}

                    <div className="w-full">
                        {tripPlan.itinerary.map((day) => (
                            <div key={day.day} className="w-full relative mb-[20px]">
                                <div className="sticky top-24 z-10 flex items-center gap-4 mb-4">
                                    <div className="px-[6px] py-[4px] text-[16px] mr-[10px]" style={{ background: '#FDB88F', borderRadius: '0 20px 20px 0', color: 'white', fontWeight: 'bold' }}>
                                        Ngày {day.day}
                                    </div>
                                    <h3 className="px-[8px] py-[2px] text-[16px]" style={{ background: 'white', borderRadius: '5px', color: 'black', fontWeight: 'semibold', border: '1px solid #C4C4C4' }}>
                                        {day.date}
                                    </h3>
                                </div>

                                <div className="w-full space-y-4 pl-[8px] border-l-2 flex flex-col gap-[20px]" style={{ borderLeftColor: '#FDB88F' }}>
                                    {day.events.map((event) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            date={day.date}
                                            onReject={onReject}
                                            onRestore={onRestore}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
