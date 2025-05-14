import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function Calendar({
  selectedDate,
  onDateSelect,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  // Day names
  const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

  // Get month name
  const getMonthName = (month: number) => {
    const monthNames = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ];
    return monthNames[month];
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Get days from previous month to fill the first row
    const daysFromPrevMonth = startingDayOfWeek;
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

    // Days from next month to fill the last row
    const lastDayOfWeekIndex = new Date(
      currentYear,
      currentMonth,
      daysInMonth,
    ).getDay();
    const daysFromNextMonth = 6 - lastDayOfWeekIndex;

    const calendarDays = [];

    // Previous month days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(
        currentYear,
        currentMonth - 1,
        prevMonthLastDay - i,
      );
      calendarDays.push({
        date,
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isSelected: isSameDay(date, selectedDate),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      calendarDays.push({
        date,
        day: i,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
        isSelected: isSameDay(date, selectedDate),
      });
    }

    // Next month days
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      calendarDays.push({
        date,
        day: i,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        isSelected: isSameDay(date, selectedDate),
      });
    }

    return calendarDays;
  };

  // Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Handle month navigation
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Go to today
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    onDateSelect(today);
  };

  // Group days into weeks
  const weeks = [];
  const days = generateCalendarDays();
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={goToPrevMonth}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-medium">
            {getMonthName(currentMonth)} {currentYear}
          </span>
          <button
            onClick={goToNextMonth}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="text-sm"
        >
          Hoy
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day names */}
        {dayNames.map((day, index) => (
          <div
            key={index}
            className="p-2 text-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => (
              <button
                key={dayIndex}
                onClick={() => onDateSelect(day.date)}
                className={`rounded-md p-2 text-center text-sm ${day.isCurrentMonth ? "text-gray-900" : "text-gray-400"} ${day.isToday ? "bg-gray-100 font-bold" : ""} ${day.isSelected ? "bg-indigo-100 font-semibold text-indigo-600" : "hover:bg-gray-50"} ${day.isSelected && day.isToday ? "bg-indigo-200" : ""} `}
              >
                {day.day}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
