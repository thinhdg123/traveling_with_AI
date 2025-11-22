
import { ItineraryEvent } from "../types/types";

/**
 * Converts specific date and time string (e.g. "2023-10-25", "09:00 AM") into ISO format for Google Calendar
 * Google Calendar format: YYYYMMDDTHHMMSSZ
 */
const formatToGoogleCalendarDate = (dateStr: string, timeStr: string): string => {
  try {
    // Parse the date
    const date = new Date(dateStr);

    // Parse the time (Assume format is HH:MM AM/PM or HH:MM)
    const [time, modifier] = timeStr.split(' ');
    const parts = time.split(':').map(Number);
    let hours = parts[0];
    const minutes = parts[1];

    if (modifier) {
      if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
      if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
    }

    date.setHours(hours, minutes, 0);

    return date.toISOString().replace(/-|:|\.\d+/g, '');
  } catch (e) {
    // Fallback to just the date if parsing fails
    return new Date().toISOString().replace(/-|:|\.\d+/g, '');
  }
};

export const generateGoogleCalendarLink = (event: ItineraryEvent, dateStr: string): string => {
  const startTime = formatToGoogleCalendarDate(dateStr, event.time);

  // Default to 1.5 hours duration
  // Re-do parsing to be safe for calculation
  const [time, modifier] = event.time.split(' ');
  const parts = time.split(':').map(Number);
  let hours = parts[0];
  const minutes = parts[1];
  if (modifier) {
    if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
  }

  // Add 90 minutes
  const endTimestamp = new Date(new Date(dateStr).setHours(hours, minutes + 90));
  const endTime = endTimestamp.toISOString().replace(/-|:|\.\d+/g, '');

  const location = event.address || event.locationName;

  const details = `${event.description}\n\nCost: ${event.costEstimate} ${event.currency}\nContact: ${event.phoneNumber || 'N/A'}\nTransport: ${event.transportMethod}`;

  const baseUrl = "https://calendar.google.com/calendar/render";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Trip: ${event.activity}`,
    dates: `${startTime}/${endTime}`,
    details: details,
    location: location,
  });

  return `${baseUrl}?${params.toString()}`;
};
