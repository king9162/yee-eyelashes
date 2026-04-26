import { google } from "googleapis";

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON!;
  const key  = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

export type CalendarEventInput = {
  summary:     string;
  description: string;
  date:        string; // "YYYY-MM-DD"
  time:        string; // "10:00 AM"
  durationMin: number;
  attendeeEmail: string;
  attendeeName:  string;
};

// Parse "10:00 AM" → { hour, minute }
function parseTime(t: string) {
  const [hhmm, period] = t.split(" ");
  let [hour, minute]   = hhmm.split(":").map(Number);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour  = 0;
  return { hour, minute };
}

export async function deleteCalendarEvent(eventId: string) {
  try {
    const auth     = getAuth();
    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      eventId,
    });
  } catch {
    // ignore if already deleted
  }
}

export async function createCalendarEvent(event: CalendarEventInput) {
  const auth     = getAuth();
  const calendar = google.calendar({ version: "v3", auth });

  const { hour, minute } = parseTime(event.time);
  const pad = (n: number) => String(n).padStart(2, "0");
  const startStr = `${event.date}T${pad(hour)}:${pad(minute)}:00`;
  const endMin   = minute + event.durationMin;
  const endHour  = hour + Math.floor(endMin / 60);
  const endStr   = `${event.date}T${pad(endHour)}:${pad(endMin % 60)}:00`;

  const res = await calendar.events.insert({
    calendarId:  process.env.GOOGLE_CALENDAR_ID!,
    sendUpdates: "all",
    requestBody: {
      summary:     event.summary,
      description: event.description,
      start: { dateTime: startStr, timeZone: "America/New_York" },
      end:   { dateTime: endStr,   timeZone: "America/New_York" },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 60 },
        ],
      },
    },
  });

  return res.data.id ?? null;
}
