import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM_EMAIL ?? "booking@yeeeyelashes.com";

export type BookingEmailData = {
  name:          string;
  email:         string;
  service:       string;
  serviceLabel:  string;
  date:          string; // "YYYY-MM-DD"
  time:          string; // "10:00 AM"
  phone:         string;
  notes?:        string;
};

// Generate .ics calendar file content
function buildICS(data: BookingEmailData): string {
  const [year, month, day] = data.date.split("-").map(Number);
  const [hhmm, period]     = data.time.split(" ");
  let [hour, minute]       = hhmm.split(":").map(Number);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour  = 0;

  const pad = (n: number) => String(n).padStart(2, "0");
  const dt  = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
  const endHour = (hour + 2) % 24;
  const dtEnd   = `${year}${pad(month)}${pad(day)}T${pad(endHour)}${pad(minute)}00`;
  const now     = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yee Eyelashes//Booking//EN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${now}@yeeeyelashes.com`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=America/New_York:${dt}`,
    `DTEND;TZID=America/New_York:${dtEnd}`,
    `SUMMARY:Yee Eyelashes — ${data.serviceLabel}`,
    `DESCRIPTION:Your appointment at Yee Eyelashes.\\n278 Plandome Rd 2FL\\, Manhasset\\, NY 11030\\n📞 929-806-2467`,
    "LOCATION:278 Plandome Rd 2FL\\, Manhasset\\, NY 11030",
    `ORGANIZER;CN=Yee Eyelashes:mailto:${FROM}`,
    `ATTENDEE;CN=${data.name}:mailto:${data.email}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Yee Eyelashes appointment in 1 hour",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT1440M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Yee Eyelashes appointment tomorrow",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export async function sendConfirmationEmail(data: BookingEmailData) {
  const ics         = buildICS(data);
  const formattedDate = formatDate(data.date);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f8f5ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:560px;width:100%;">

        <!-- Gold top bar -->
        <tr><td style="background:#C9A84C;height:4px;"></td></tr>

        <!-- Header -->
        <tr><td style="padding:48px 48px 32px;text-align:center;border-bottom:1px solid #f0ece4;">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A84C;">Yee Eyelashes</p>
          <h1 style="margin:0;font-size:28px;font-weight:300;color:#1c1c1c;letter-spacing:-0.02em;">Appointment Confirmed</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 48px;">
          <p style="margin:0 0 28px;font-size:14px;color:#777;line-height:1.8;">
            Hi ${data.name}, your appointment has been received and is pending confirmation. We'll reach out shortly to confirm your slot.
          </p>

          <!-- Booking summary box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;border-left:2px solid #C9A84C;margin-bottom:28px;">
            <tr><td style="padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row("Service",  data.serviceLabel)}
                ${row("Date",     formattedDate)}
                ${row("Time",     data.time)}
                ${row("Phone",    data.phone)}
                ${data.notes ? row("Notes", data.notes) : ""}
              </table>
            </td></tr>
          </table>

          <!-- Add to calendar button -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
            <tr><td style="background:#1c1c1c;text-align:center;">
              <a href="cid:calendar.ics" style="display:inline-block;padding:14px 32px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                Add to Calendar
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 6px;font-size:13px;color:#999;line-height:1.8;">
            📍 278 Plandome Rd 2FL, Manhasset, NY 11030<br/>
            📞 <a href="tel:9298062467" style="color:#C9A84C;text-decoration:none;">929-806-2467</a><br/>
            📷 <a href="https://www.instagram.com/yee_lashesny" style="color:#C9A84C;text-decoration:none;">@yee_lashesny</a>
          </p>

          <p style="margin:28px 0 0;font-size:12px;color:#bbb;line-height:1.8;">
            Please arrive on time. If you need to cancel or reschedule, notify us at least 24 hours in advance.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 48px;background:#1c1c1c;text-align:center;">
          <p style="margin:0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#555;">
            © ${new Date().getFullYear()} Yee Eyelashes · Manhasset, NY
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from:    `Yee Eyelashes <${FROM}>`,
    to:      data.email,
    subject: `Appointment Request Received — ${data.serviceLabel} on ${formattedDate}`,
    html,
    attachments: [{
      filename:    "yee-eyelashes-appointment.ics",
      content:     Buffer.from(ics).toString("base64"),
      contentType: "text/calendar; method=REQUEST",
    }],
  });
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:6px 0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A84C;width:90px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0 6px 16px;font-size:13px;color:#1c1c1c;line-height:1.6;">${value}</td>
    </tr>`;
}
