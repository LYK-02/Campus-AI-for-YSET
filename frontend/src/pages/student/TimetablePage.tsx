import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Printer,
  Info,
  Loader2,
} from "lucide-react";
import { branches } from "../../data/branches";
import { timetableApi } from "../../lib/api-client";
import type { TimetableSlot } from "../../types";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const;

interface PeriodInfo {
  number: number;
  time: string;
  startMinutes: number;
  endMinutes: number;
}

const PERIODS_DEF: PeriodInfo[] = [
  { number: 1, time: "09:00 AM - 10:00 AM", startMinutes: 9 * 60, endMinutes: 10 * 60 },
  { number: 2, time: "10:00 AM - 11:00 AM", startMinutes: 10 * 60, endMinutes: 11 * 60 },
  { number: 3, time: "11:15 AM - 12:15 PM", startMinutes: 11 * 60 + 15, endMinutes: 12 * 60 + 15 },
  { number: 4, time: "01:15 PM - 02:15 PM", startMinutes: 13 * 60 + 15, endMinutes: 14 * 60 + 15 },
  { number: 5, time: "02:15 PM - 03:15 PM", startMinutes: 14 * 60 + 15, endMinutes: 15 * 60 + 15 },
  { number: 6, time: "03:15 PM - 04:15 PM", startMinutes: 15 * 60 + 15, endMinutes: 16 * 60 + 15 },
];

export const TimetablePage: React.FC = () => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("cse-aift");
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<string>("ALL");
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    timetableApi
      .getTimetable(selectedBranchId, selectedSemester)
      .then((data) => {
        if (isMounted) {
          setSlots(data || []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSlots([]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBranchId, selectedSemester]);

  // Determine current day & time to mark ongoing class
  const now = new Date();
  const currentDayIndex = now.getDay(); // 0 is Sunday, 1 is Monday ... 5 is Friday
  const currentDayName =
    currentDayIndex >= 1 && currentDayIndex <= 5
      ? DAYS_OF_WEEK[currentDayIndex - 1]
      : null;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isCurrentSlot = (day: string, periodNumber: number) => {
    if (day !== currentDayName) return false;
    const pDef = PERIODS_DEF.find((p) => p.number === periodNumber);
    if (!pDef) return false;
    return currentMinutes >= pDef.startMinutes && currentMinutes < pDef.endMinutes;
  };

  const handlePrint = () => {
    window.print();
  };

  const daysToRender = selectedDay === "ALL" ? [...DAYS_OF_WEEK] : [selectedDay];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#315EAA] mb-1">
            <Calendar className="w-4 h-4" />
            <span>Academic Schedule & Room Locations</span>
          </div>
          <h1 className="text-2xl font-bold text-[#142B4A]">
            Student Timetable
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Official 5-day class schedule verified and released by YSET Academic Affairs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#F6F8FC] hover:bg-slate-200 text-slate-700 border border-[#CBD5E1] px-4 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Timetable</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white rounded-2xl border border-[#E3E8F0] p-5 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Branch */}
        <div className="flex-1 max-w-lg">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Enrolled Academic Branch
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full bg-[#F6F8FC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#142B4A] focus:outline-none focus:ring-2 focus:ring-[#315EAA]"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.shortName})
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Semester
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedSemester === sem
                    ? "bg-[#315EAA] text-white shadow-xs"
                    : "bg-[#F6F8FC] text-slate-600 hover:bg-slate-200"
                }`}
              >
                Sem {sem}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Day Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedDay("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            selectedDay === "ALL"
              ? "bg-[#142B4A] text-white shadow-xs"
              : "bg-white border border-[#E3E8F0] text-slate-600 hover:bg-slate-50"
          }`}
        >
          Full Week (5 Days)
        </button>
        {DAYS_OF_WEEK.map((day) => {
          const isToday = day === currentDayName;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedDay === day
                  ? "bg-[#315EAA] text-white shadow-xs"
                  : isToday
                  ? "bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  : "bg-white border border-[#E3E8F0] text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Today" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-16 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#315EAA]" />
          <p className="text-sm font-semibold">Loading your class schedule...</p>
        </div>
      ) : slots.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#315EAA]/10 flex items-center justify-center mx-auto text-[#315EAA] mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#142B4A]">
            Timetable Being Finalized
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            The timetable for <span className="font-semibold text-slate-700">{selectedBranch.shortName} Semester {selectedSemester}</span> is currently being prepared by the academic administration.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
            <Info className="w-4 h-4 text-[#315EAA]" />
            <span>As soon as the administration auto-generates the schedule, it will appear here.</span>
          </div>
        </div>
      ) : (
        /* Timetable Cards by Day */
        <div className="space-y-6">
          {daysToRender.map((day) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === day);
            const isToday = day === currentDayName;

            return (
              <div
                key={day}
                className="bg-white rounded-2xl border border-[#E3E8F0] shadow-xs overflow-hidden"
              >
                {/* Day Header */}
                <div
                  className={`px-6 py-4 flex items-center justify-between border-b ${
                    isToday
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                      : "bg-[#142B4A] border-[#1D3B63] text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm tracking-wide">{day}</span>
                    {isToday && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Today's Schedule
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isToday ? "text-emerald-700" : "text-slate-300"
                    }`}
                  >
                    6 Academic Periods (09:00 AM – 04:15 PM)
                  </span>
                </div>

                {/* Periods Grid */}
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PERIODS_DEF.map((period) => {
                    const slot = daySlots.find((s) => s.periodNumber === period.number);
                    const isOngoing = isCurrentSlot(day, period.number);

                    // Add break indicators
                    const showTeaBreakAfter = period.number === 2;
                    const showLunchBreakAfter = period.number === 3;

                    return (
                      <React.Fragment key={period.number}>
                        <div
                          className={`rounded-2xl p-4.5 border transition-all flex flex-col justify-between gap-3 ${
                            isOngoing
                              ? "bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-400/20 shadow-md"
                              : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#315EAA]/40 hover:bg-white shadow-2xs"
                          }`}
                        >
                          <div>
                            {/* Top row: Period number & Time badge */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-bold text-xs uppercase text-slate-500 tracking-wider">
                                Period {period.number}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{period.time}</span>
                              </div>
                            </div>

                            {/* Ongoing Badge */}
                            {isOngoing && (
                              <div className="mb-2 inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                Ongoing Class Right Now
                              </div>
                            )}

                            {/* Course Details */}
                            {slot && slot.course ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#315EAA]/10 text-[#315EAA]">
                                    {slot.course.code}
                                  </span>
                                  <span className="text-[11px] font-semibold text-slate-400">
                                    {slot.course.credits} Credits
                                  </span>
                                </div>
                                <h3 className="font-bold text-sm text-[#142B4A] leading-snug">
                                  {slot.course.name}
                                </h3>
                              </div>
                            ) : (
                              <div className="py-4 text-center text-slate-400 text-xs italic">
                                Self-Study / Library Slot
                              </div>
                            )}
                          </div>

                          {/* Footer: Room / Lab venue & Faculty */}
                          {slot && (
                            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                              <div className="flex items-center gap-1 font-medium text-slate-700 truncate">
                                <MapPin className="w-3.5 h-3.5 text-[#17A89B] shrink-0" />
                                <span className="truncate">{slot.room}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {slot.facultyName || "YSET Faculty"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Break Dividers */}
                        {showTeaBreakAfter && (
                          <div className="col-span-full py-1.5 px-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between">
                            <span>☕ Morning Tea & Refreshment Break</span>
                            <span className="font-mono text-[11px]">11:00 AM – 11:15 AM (15 mins)</span>
                          </div>
                        )}

                        {showLunchBreakAfter && (
                          <div className="col-span-full py-2 px-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center justify-between">
                            <span>🍽️ Campus Lunch & Recess Break</span>
                            <span className="font-mono text-[11px]">12:15 PM – 01:15 PM (60 mins)</span>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
