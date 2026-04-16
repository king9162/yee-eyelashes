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

export async function createCalendarEvent(event: CalendarEventInput) {
  const auth     = getAuth();
  const calendar = google.calendar({ version: "v3", auth });

  const { hour, minute } = parseTime(event.time);
  const start = new Date(`${event.date}T00:00:00`);
  start.setHours(hour, minute, 0, 0);
  const end = new Date(start.getTime() + event.durationMin * 60 * 1000);

  const toISO = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "-05:00"); // ET

  const res = await calendar.events.insert({
    calendarId:  process.env.GOOGLE_CALENDAR_ID!,
    sendUpdates: "all",
    requestBody: {
      summary:     event.summary,
      description: event.description,
      start: { dateTime: toISO(start), timeZone: "America/New_York" },
      end:   { dateTime: toISO(end),   timeZone: "America/New_York" },
      attendees: [{ email: event.attendeeEmail, displayName: event.attendeeName }],
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
