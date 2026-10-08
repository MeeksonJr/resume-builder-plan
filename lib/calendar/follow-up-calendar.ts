/**
 * Follow-Up Reminder & .ics iCalendar Generator
 * Produces standard RFC 5545 iCalendar files for application deadlines, interviews, and thank-you notes.
 */

export interface CalendarEventDetails {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  durationMinutes?: number;
}

export function generateICalendarEvent(event: CalendarEventDetails): string {
  const formatDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/g, "");

  const startStr = formatDate(event.startDate);
  const endDate = new Date(event.startDate.getTime() + (event.durationMinutes || 30) * 60 * 1000);
  const endStr = formatDate(endDate);
  const uid = `rf-${Date.now()}-${Math.random().toString(36).slice(2)}@resumeforge.app`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ResumeForge//Career Assistant//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:${event.title.replace(/[,;]/g, "\\$&")}
DESCRIPTION:${event.description.replace(/[\n\r]/g, "\\n").replace(/[,;]/g, "\\$&")}
LOCATION:${(event.location || "Online").replace(/[,;]/g, "\\$&")}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${event.title.replace(/[,;]/g, "\\$&")}
END:VALARM
END:VEVENT
END:VCALENDAR`;
}
