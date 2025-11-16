"use client";

import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Calendar,
  dateFnsLocalizer,
  type View,
  Views,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
}

interface AdminCalendarViewProps {
  events: CalendarEvent[];
  defaultView?: View;
}

export function AdminCalendarView({ events, defaultView = Views.MONTH }: AdminCalendarViewProps) {
  const calendarEvents = events.map((event) => ({
    ...event,
    start: event.start instanceof Date ? event.start : new Date(event.start),
    end: event.end instanceof Date ? event.end : new Date(event.end),
  }));

  return (
    <div className="h-[600px] rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        defaultView={defaultView}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        style={{ height: "100%" }}
      />
    </div>
  );
}
