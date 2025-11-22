'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Calendar, { CalendarValue } from './Calendar';
import Button from './Button';
import PlanDisplay from './PlanDisplay';
import { Calendar as CalendarIcon } from 'lucide-react';
import { generateTrip, updateTrip } from '../service/geminiService';
import { UserPreferences, TripPlan } from '../types/types';

export default function TravelPlanner() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [dateError, setDateError] = useState('');
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const handleGeneratePlan = async () => {
    if (!startDate || !endDate) {
      setError('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
      return;
    }

    if (!description.trim()) {
      setError('Vui lòng nhập mô tả chuyến đi');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setTripPlan(null);

      const userPreferences: UserPreferences = {
        destination: 'Vietnam', // Defaulting to Vietnam as per context, or could be dynamic
        startDate,
        endDate,
        style: [],
        prompt: description,
        budget: 'moderate',
        partySize: { adults: 2, children: 0 }, // Default party size
      };

      const plan = await generateTrip(userPreferences);
      setTripPlan(plan);
    } catch (err) {
      console.error('Error generating trip plan:', err);
      setError('Có lỗi xảy ra khi tạo kế hoạch. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
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
    } catch (err) {
      setError("Failed to update itinerary. Please try again.");
    } finally {
      setRegenerating(false);
    }
  };

  const [calendarRange, setCalendarRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const startIconRef = useRef<HTMLButtonElement | null>(null);
  const endIconRef = useRef<HTMLButtonElement | null>(null);

  const toDateOrNull = (value: string) => (value ? new Date(value) : null);
  const formatInputDate = (date: Date | null) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const syncCalendarWithInputs = (nextStart: string, nextEnd: string) => {
    setCalendarRange([toDateOrNull(nextStart), toDateOrNull(nextEnd)]);
  };

  const handleStartDateChange = (value: string, currentEndDate: string, setStart: (val: string) => void, setError: (val: string) => void) => {
    setStart(value);
    if (value && currentEndDate && new Date(value) > new Date(currentEndDate)) {
      setError('Ngày bắt đầu không thể lớn hơn ngày kết thúc');
    } else {
      setError('');
    }
  };

  const handleEndDateChange = (value: string, currentStartDate: string, setEnd: (val: string) => void, setError: (val: string) => void) => {
    setEnd(value);
    if (value && currentStartDate && new Date(value) < new Date(currentStartDate)) {
      setError('Ngày kết thúc không thể nhỏ hơn ngày bắt đầu');
    } else {
      setError('');
    }
  };

  const onStartDateChange = (value: string) => {
    handleStartDateChange(value, endDate, setStartDate, setDateError);
    syncCalendarWithInputs(value, endDate);
  };

  const onEndDateChange = (value: string) => {
    handleEndDateChange(value, startDate, setEndDate, setDateError);
    syncCalendarWithInputs(startDate, value);
  };

  const handleCalendarSelection = (value: CalendarValue) => {
    if (!Array.isArray(value)) return;

    const [start, end] = value as [Date | null, Date | null];
    setCalendarRange([start, end]);

    const startStr = formatInputDate(start);
    const endStr = formatInputDate(end);

    handleStartDateChange(startStr, endDate, setStartDate, setDateError);
    const normalizedStart = startStr !== undefined ? startStr : startDate;
    handleEndDateChange(endStr, normalizedStart, setEndDate, setDateError);
  };

  const toggleCalendar = () => {
    setIsCalendarOpen((prev: boolean) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isCalendarOpen) return;

      const target = event.target as Node;
      const clickedCalendar = calendarRef.current?.contains(target);
      const clickedIcon =
        startIconRef.current?.contains(target) ||
        endIconRef.current?.contains(target);

      if (!clickedCalendar && !clickedIcon) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  return (
    <div className="h-full relative">
      {/* Left Sidebar */}
      <div className="h-full overflow-y-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6 rounded-lg p-4 pt-[10px] w-full h-auto" style={{ background: 'white' }}>
          <div className="relative w-[170px] h-[80px]">
            <Image
              src="/images/logo_travelpal.png"
              alt="LOGO"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div
          className="w-full py-[20px] px-[25px] flex flex-col gap-[10px]"
          style={{ background: '#FAF8F8', boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.1)' }}
        >
          {/* Start Date Input */}
          <div className="flex relative items-center" >
            <label className="block text-gray-700 font-medium mb-2 text-[14px] absolute px-[5px]" style={{ background: '#FAF8F8', top: '-15%', left: '3%' }}>
              Ngày bắt đầu
            </label>
            <input
              type="date"
              value={startDate}
              placeholder="ngày/tháng/năm"
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-3 py-2 p-[8px] pr-12 border-2 border-gray-200 rounded-[20px] focus:outline-none focus:border-orange-400 transition-colors text-[16px] text-center"
              style={{ background: '#FAF8F8', border: '1px solid #D5D4DF', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)' }}
            />
            <button
              type="button"
              aria-label="Chọn ngày bắt đầu trên lịch"
              className="absolute inset-y-0 flex items-center text-orange-400 p-[6px] flex justify-center items-center"
              onClick={toggleCalendar}
              ref={startIconRef}
              style={{ right: '10px', border: 'none', backgroundColor: '#E5E5E5', borderRadius: '50%' }}
            >
              <CalendarIcon size={20} strokeWidth={2} />
            </button>
          </div>

          {/* End Date Input */}
          <div className="flex relative items-center">
            <label className="block text-gray-700 font-medium mb-2 text-sm text-[14px] absolute px-[5px]" style={{ background: '#FAF8F8', top: '-15%', left: '3%' }}>
              Ngày kết thúc
            </label>
            <input
              type="date"
              value={endDate}
              placeholder=" ngày/tháng/năm"
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-3 py-2 p-[8px] pr-12 border-2 border-gray-200 rounded-[20px] focus:outline-none focus:border-orange-400 transition-colors text-[16px] text-center"
              style={{ background: '#FAF8F8', border: '1px solid #D5D4DF', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)' }}
            />
            <button
              type="button"
              aria-label="Chọn ngày kết thúc trên lịch"
              className="absolute inset-y-0 right-3 flex items-center text-orange-400 p-[6px] flex justify-center"
              onClick={toggleCalendar}
              ref={endIconRef}
              style={{ right: '10px', border: 'none', backgroundColor: '#E5E5E5', borderRadius: '50%' }}
            >
              <CalendarIcon size={20} strokeWidth={2} />
            </button>
          </div>

          <div className="relative">
            {isCalendarOpen && (
              <div
                ref={calendarRef}
                className="absolute z-10 mt-2 rounded-2xl border border-[#F6D9C2] bg-white/95 p-3 shadow-xl"
                style={{ borderRadius: '10px', right: '10px', left: 'auto' }}
              >
                <Calendar
                  type="range"
                  value={calendarRange}
                  onChange={handleCalendarSelection}
                  className="bg-transparent"
                />
              </div>
            )}
          </div>

          {/* Description Textarea */}
          <div className="relative pb-[40px] rounded-[10px] border-2 border-gray-200 overflow-hidden" style={{ background: '#FAF8F8', border: '1px solid #D5D4DF', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)' }}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hãy miêu tả mong muốn chi tiết của bạn khi lập kế hoạch"
              rows={8}
              className="w-full px-3 py-2 p-[10px] rounded-lg focus:outline-none focus:border-orange-400 transition-colors resize-none text-sm  text-[16px]" style={{ border: 'none', background: '#FAF8F8' }}
            />
            <div className="flex justify-end items-center mt-2 gap-2 absolute bottom-[10px] right-[10px] transition-all duration-200" onMouseEnter={(e) => {
              const span = e.currentTarget.querySelector('#suggestion');
              if (span) {
                (span as HTMLSpanElement).style.color = 'black';
              }
              e.currentTarget.style.transform = 'translateY(-2px)';
            }} onMouseLeave={(e) => {
              const span = e.currentTarget.querySelector('#suggestion');
              if (span) {
                (span as HTMLSpanElement).style.color = '#AFAFAF';
              }
              e.currentTarget.style.transform = 'translateY(0px)';
            }}>
              <span id="suggestion" className="text-xs mr-[10px] cursor-pointer" style={{ color: '#AFAFAF' }}>Gợi ý</span>
              <div className="p-[4px] bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors" style={{ border: '1px solid #D5D4DF', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)' }}>
                <Image
                  src="/images/gemini_logo.svg"
                  alt="Gemini"
                  width={18}
                  height={18}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              className="w-full"
              disabled={isLoading}
              onClick={handleGeneratePlan}
            >
              {isLoading ? '...' : 'Tạo kế hoạch'}
            </Button>
          </div>

          {/* Plan Display */}
          <div className="w-full mt-6 flex-1" style={{ minHeight: '100%' }}>
            <PlanDisplay
              tripPlan={tripPlan}
              isLoading={isLoading}
              error={error}
              onReject={handleRejectEvent}
              onRestore={handleRestoreEvent}
              onRegenerate={handleRegenerateRejected}
              isRegenerating={regenerating}
            />
          </div>
        </div>
      </div>

    </div>
  )
}
