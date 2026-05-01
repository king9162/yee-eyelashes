import { Resend } from "resend";

const FROM = "booking@yeeeyelashes.com";
const getResend = () => new Resend(process.env.RESEND_API_KEY ?? "placeholder");

export type BookingEmailData = {
  name:          string;
  email:         string;
  service:       string;
  serviceLabel:  string;
  date:          string; // "YYYY-MM-DD"
  time:          string; // "10:00 AM"
  phone:         string;
  notes?:        string;
  lang?:         string;
};

// Generate Google Calendar URL
function buildGoogleCalendarUrl(data: BookingEmailData): string {
  const [year, month, day] = data.date.split("-").map(Number);
  const [hhmm, period]     = data.time.split(" ");
  let [hour, minute]       = hhmm.split(":").map(Number);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour  = 0;

  // NY UTC offset
  const probe = new Date(`${data.date}T12:00:00Z`);
  const nyHour = parseInt(probe.toLocaleString("en-US", { timeZone: "America/New_York", hour: "2-digit", hour12: false }));
  const offset = 12 - nyHour;

  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const start = new Date(Date.UTC(year, month - 1, day, hour + offset, minute, 0));
  const end   = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    action:   "TEMPLATE",
    text:     `Yee Eyelashes — ${data.serviceLabel}`,
    dates:    `${fmt(start)}/${fmt(end)}`,
    details:  "Your appointment at Yee Eyelashes. 278 Plandome Rd 2FL, Manhasset, NY 11030 | 📞 929-806-2467",
    location: "278 Plandome Rd 2FL, Manhasset, NY 11030",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

// ── 1. Booking received email (sent to client on submit) ─────────────────────
export async function sendConfirmationEmail(data: BookingEmailData) {
  const calUrl        = buildGoogleCalendarUrl(data);
  const formattedDate = formatDate(data.date);
  const zh            = data.lang === "zh";

  const title    = zh ? "預約確認" : "Booking Confirmed";
  const greeting = zh
    ? `您好 ${data.name}，您的預約已確認。期待與您見面！`
    : `Hi ${data.name}, your appointment has been confirmed. We look forward to seeing you!`;
  const calBtn   = zh ? "加入行事曆" : "Add to Calendar";
  const policy   = zh
    ? "訂金可抵扣服務費用。提前至少 24 小時取消或改期，可獲全額退款。預約前 24 小時內取消、無故缺席或遲到超過 15 分鐘，訂金將不予退還。"
    : "A deposit is required to secure your appointment and will be applied toward your service total. Deposits are refundable or transferable with at least 24 hours' notice. Cancellations within 24 hours, no-shows, or late arrivals over 15 minutes may result in deposit forfeiture.";
  const subject  = zh
    ? `預約確認 — ${data.serviceLabel}・${formattedDate}`
    : `Appointment Confirmed — ${data.serviceLabel} on ${formattedDate}`;

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
        <tr><td style="background:#C9A84C;height:4px;"></td></tr>
        <tr><td style="padding:48px 48px 32px;text-align:center;border-bottom:1px solid #f0ece4;">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A84C;">Yee Eyelashes</p>
          <h1 style="margin:0;font-size:28px;font-weight:300;color:#1c1c1c;letter-spacing:-0.02em;">${title}</h1>
        </td></tr>
        <tr><td style="padding:40px 48px;">
          <p style="margin:0 0 28px;font-size:14px;color:#777;line-height:1.8;">${greeting}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;border-left:2px solid #C9A84C;margin-bottom:28px;">
            <tr><td style="padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row(zh ? "服務" : "Service",  data.serviceLabel)}
                ${row(zh ? "日期" : "Date",     formattedDate)}
                ${row(zh ? "時間" : "Time",     data.time)}
                ${row(zh ? "電話" : "Phone",    data.phone)}
                ${data.notes ? row(zh ? "備註" : "Notes", data.notes) : ""}
              </table>
            </td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
            <tr><td style="background:#1c1c1c;text-align:center;">
              <a href="${calUrl}" style="display:inline-block;padding:14px 32px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                ${calBtn}
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 6px;font-size:13px;color:#999;line-height:1.8;">
            📍 278 Plandome Rd 2FL, Manhasset, NY 11030<br/>
            📞 <a href="tel:9298062467" style="color:#C9A84C;text-decoration:none;">929-806-2467</a><br/>
            📷 <a href="https://www.instagram.com/yee_lashesny" style="color:#C9A84C;text-decoration:none;">@yee_lashesny</a>
          </p>
          <p style="margin:28px 0 0;font-size:12px;color:#bbb;line-height:1.8;">${policy}</p>
        </td></tr>
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

  await getResend().emails.send({
    from:    `Yee Eyelashes <${FROM}>`,
    to:      data.email,
    subject,
    html,
  });
}

// ── 2. Betty notification (sent to owner when new booking arrives) ───────────
export async function sendBettyNotification(data: BookingEmailData) {
  const bettyEmail    = process.env.BETTY_EMAIL ?? "yeelashesny@gmail.com";
  const formattedDate = formatDate(data.date);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f8f5ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:560px;width:100%;">
        <tr><td style="background:#C9A84C;height:4px;"></td></tr>
        <tr><td style="padding:40px 48px 32px;text-align:center;border-bottom:1px solid #f0ece4;">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A84C;">Yee Eyelashes</p>
          <h1 style="margin:0;font-size:24px;font-weight:300;color:#1c1c1c;">New Booking</h1>
        </td></tr>
        <tr><td style="padding:36px 48px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;border-left:2px solid #C9A84C;">
            <tr><td style="padding:24px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row("Client",  data.name)}
                ${row("Phone",   data.phone)}
                ${row("Email",   data.email)}
                ${row("Service", data.serviceLabel)}
                ${row("Date",    formattedDate)}
                ${row("Time",    data.time)}
                ${data.notes ? row("Notes", data.notes) : ""}
              </table>
            </td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
            <tr><td style="background:#1c1c1c;text-align:center;">
              <a href="https://www.yeeeyelashes.com/admin" style="display:inline-block;padding:14px 32px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                View in Admin →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 48px;background:#1c1c1c;text-align:center;">
          <p style="margin:0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#555;">
            © ${new Date().getFullYear()} Yee Eyelashes · Manhasset, NY
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await getResend().emails.send({
    from:    `Yee Eyelashes <${FROM}>`,
    to:      bettyEmail,
    subject: `New Booking — ${data.name} · ${data.serviceLabel} on ${formattedDate}`,
    html,
  });
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:6px 0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A84C;width:90px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0 6px 16px;font-size:13px;color:#1c1c1c;line-height:1.6;">${value}</td>
    </tr>`;
}
