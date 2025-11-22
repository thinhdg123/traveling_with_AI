'use client';

import React from 'react';
import { TripStats } from '../types/types';
import { CloudSun, DollarSign, MapPin, CalendarClock } from 'lucide-react';

interface DashboardProps {
  stats: TripStats;
  tips: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const Dashboard: React.FC<DashboardProps> = ({ stats, tips }) => {
  // Mock data for the chart based on stats (simplification for viz)
  const chartData = [
    { name: 'Activities', value: stats.totalCost * 0.4 },
    { name: 'Food', value: stats.totalCost * 0.3 },
    { name: 'Transport', value: stats.totalCost * 0.1 },
    { name: 'Lodging', value: stats.totalCost * 0.2 },
  ];

  return (
    // Applied styles from TravelPlanner
    <div className="w-full h-full">
      <h2 className="text-[18px] font-bold !text-gray-800 mb-6">Tổng quan</h2>

      <div className="grid grid-cols-2 gap-[8px] mb-8" >
        <StatCard
          icon={<DollarSign className="w-full h-full" style={{ color: "green" }} />}
          label="Ước tính chi phí"
          value={`${stats.totalCost.toLocaleString()} ${stats.currency}`}
          sub=""
          backgroundColor="#E8F5E9" // Light Green
        />
        <StatCard
          icon={<CalendarClock className="w-full h-full" style={{ color: "purple" }} />}
          label="Thời gian"
          value={`${stats.durationDays} Days`}
          sub=""
          backgroundColor="#F3E5F5" // Light Purple
        />
        <StatCard
          icon={<MapPin className="w-full h-full" style={{ color: "red" }} />}
          label="Số địa điểm"
          value={stats.totalEvents.toString()}
          sub=""
          backgroundColor="#FFEBEE" // Light Red
        />
        <StatCard
          icon={<CloudSun className="w-full h-full" style={{ color: "orange" }} />}
          label="Thời tiết"
          value={stats.weatherSummary}
          sub=""
          backgroundColor="#FFF3E0" // Light Orange
        />
      </div>
      <div className="">
        <h3 className="text-[18px] font-semibold text-gray-500 mb-4 tracking-wider">Gợi ý</h3>
        <div className="p-[5px]" style={{ backgroundColor: "#DBEAFE", borderRadius: "10px" }}>
          <ul className="" style={{ margin: "8px", padding: "0" }}>
            {tips.split('. ').map((tip, idx) => (
              tip && <li key={idx} className="flex items-start gap-[8px] text-sm mb-[8px]" style={{color: "gray"}}>
                <span className="inline-block w-[10px] h-[10px] mt-[5px] mr-[5px] flex-shrink-0" style={{ backgroundColor: "#0088FE", borderRadius: "50%" }}></span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, backgroundColor }: { icon: React.ReactNode, label: string, value: string, sub: string, backgroundColor?: string }) => (
  <div className="p-[10px] flex items-center gap-[10px]" style={{ backgroundColor: backgroundColor || '#F9FAFB', borderRadius: "20px" }}>
    <div className="p-[5px] w-[30px] h-[30px] flex items-center justify-center" style={{ backgroundColor: "white", borderRadius: "50%", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)" }}>
      {icon}
    </div>
    <div className="flex flex-col gap-[4px]">
      <p className="text-[12px] font-medium uppercase" style={{ color: "gray", margin: "0" }}>{label}</p>
      <p className="text-[16px] truncate max-w-[120px]" style={{ color: "black", fontWeight: "bold", margin: "0" }} title={value}>{value}</p>
      <p className="text-[12px] truncate max-w-[120px]" style={{ color: "gray", margin: "0" }} title={sub}>{sub}</p>
    </div>
  </div>
);