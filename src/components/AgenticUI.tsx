'use client';

import React, { useState, useCallback } from 'react';
import { ChatWindow } from './ChatWindow';
import { generateTrip, updateTrip, sendChatMessage } from '../service/geminiService';
import { TripPlan, UserPreferences, ChatMessage } from '../types/types';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import PlanDisplay from './PlanDisplay';

interface AgenticUIProps {
  className?: string;
}

export const AgenticUI: React.FC<AgenticUIProps> = ({ className = "" }) => {
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const handleCreateTrip = async (prefs: UserPreferences) => {
    setLoading(true);
    setError(null);
    try {
      const plan = await generateTrip(prefs);
      setTripPlan(plan);
      setMessages([
        { role: 'model', text: `I've created a trip to ${prefs.destination} for you! You can ask me to modify details or just chat about the location.` }
      ]);
    } catch (err) {
      setError("Failed to generate itinerary. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure? This will delete the current plan.")) {
      setTripPlan(null);
      setMessages([]);
      setError(null);
    }
  };

  const handleChatMessage = async (text: string) => {
    if (!tripPlan) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setChatLoading(true);

    try {
      const { text: responseText, updatedPlan } = await sendChatMessage(text, tripPlan);

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);

      if (updatedPlan) {
        setTripPlan(updatedPlan);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "I encountered an error processing that." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleRejectEvent = useCallback((eventId: string) => {
    setTripPlan(prev => {
      if (!prev) return null;
      const newItinerary = prev.itinerary.map(day => ({
        ...day,
        events: day.events.map(evt =>
          evt.id === eventId ? { ...evt, status: 'rejected' as const } : evt
        )
      }));
      return { ...prev, itinerary: newItinerary };
    });
  }, []);

  const handleRestoreEvent = useCallback((eventId: string) => {
    setTripPlan(prev => {
      if (!prev) return null;
      const newItinerary = prev.itinerary.map(day => ({
        ...day,
        events: day.events.map(evt =>
          evt.id === eventId ? { ...evt, status: 'accepted' as const } : evt
        )
      }));
      return { ...prev, itinerary: newItinerary };
    });
  }, []);

  const handleRegenerateRejected = async () => {
    if (!tripPlan) return;

    const rejectedIds: string[] = [];
    tripPlan.itinerary.forEach(day => {
      day.events.forEach(evt => {
        if (evt.status === 'rejected') rejectedIds.push(evt.id);
      });
    });

    if (rejectedIds.length === 0) return;

    setRegenerating(true);
    try {
      const updatedPlan = await updateTrip(tripPlan, rejectedIds);
      setTripPlan(updatedPlan);
      setMessages(prev => [...prev, { role: 'model', text: "I've replaced the rejected events with new options." }]);
    } catch (err) {
      setError("Failed to update itinerary. Please try again.");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    // Force light mode colors with !important to override global Next.js styles
    <div className={`w-full h-full !bg-gray-50 !text-gray-900 ${className}`}>
      {/* Header within AgenticUI - force white background */}
      <div className="!bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Loader2 className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
            </div>
            <h1 className="font-bold text-xl tracking-tight !text-gray-900">Việt Nam</h1>
          </div>
          {tripPlan && (
            <button
              onClick={handleReset}
              className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              End Trip & Start New
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 animate-pulse">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!tripPlan ? (
          <div className="mt-10 animate-fade-in-up max-w-3xl mx-auto">
            {/* Placeholder for initial state or input form if needed, 
                 currently assuming parent component handles initial input or it's handled elsewhere 
                 Wait, the original code had an empty div here. 
                 I should probably check if there is a way to trigger creation. 
                 Looking at the code, handleCreateTrip is defined but not used in the render.
                 It seems the original code was incomplete or relied on external triggers?
                 Ah, I see `handleCreateTrip` is not passed to anything.
                 Let's check if I missed something from the original file.
                 The original file had an empty div: <div className="mt-10 animate-fade-in-up max-w-3xl mx-auto"></div>
                 And `handleCreateTrip` was defined but not used.
                 I will keep it as is for now, assuming the user will integrate the input form later or it's triggered externally.
                 However, to make it testable, I might need to expose it or add a temporary button if the user wants.
                 But the request was just to "get the output from API and show in PlanDisplay".
                 So I will focus on the display part.
             */}
            <div className="text-center p-10">
              <button onClick={() => handleCreateTrip({
                destination: "Hanoi",
                startDate: "2023-10-27",
                endDate: "2023-10-30",
                style: [],
                prompt: "A fun trip",
                budget: "medium",
                partySize: { adults: 2, children: 0 }
              })} className="bg-blue-600 text-white px-4 py-2 rounded">
                Test Generate Trip (Dev Only)
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column: Chat Interface */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 lg:h-[calc(100vh-150px)]">
              <ChatWindow
                messages={messages}
                onSendMessage={handleChatMessage}
                isLoading={chatLoading}
              />
            </div>

            {/* Right Column: Itinerary Content */}
            <div className="lg:col-span-8">
              <PlanDisplay
                tripPlan={tripPlan}
                isLoading={loading}
                error={error}
                onReject={handleRejectEvent}
                onRestore={handleRestoreEvent}
                onRegenerate={handleRegenerateRejected}
                isRegenerating={regenerating}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};