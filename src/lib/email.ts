import { Resend } from "resend";
import { createHmac } from "crypto";

const FROM = "booking@yeeeyelashes.com";
const BASE = "https://www.yeeeyelashes.com";
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
  bookingId?:    string;
};

export function generateCancelToken(bookingId: string): string {
  const secret = process.env.ADMIN_SECRET_KEY ?? "fallback-secret";
  return createHmac("sha256", secret).update(bookingId).digest("hex").slice(0, 40);
}

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
    details:  "Your appointment at Yee Eyelashes. 278 Plandome Rd, 2nd Floor, Manhasset, NY 11030 | 📞 (516) 984-3859",
    location: "278 Plandome Rd, 2nd Floor, Manhasset, NY 11030",
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
  const lang          = data.lang ?? "en";

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

  // Cancel / reschedule links
  const cancelBlock = data.bookingId ? (() => {
    const token       = generateCancelToken(data.bookingId!);
    const cancelUrl   = `${BASE}/${lang}/cancel?id=${data.bookingId}&token=${token}`;
    const reschedUrl  = `${BASE}/${lang}/booking`;
    const cancelLabel = zh ? "取消預約" : "Cancel Appointment";
    const resLabel    = zh ? "更改時間" : "Reschedule";
    return `
      <table cellpadding="0" cellspacing="0" style="margin:16px auto 0;width:100%;max-width:400px;">
        <tr>
          <td style="padding-right:8px;">
            <a href="${reschedUrl}" style="display:block;padding:12px 0;background:#f0ece4;text-align:center;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#1c1c1c;text-decoration:none;">${resLabel}</a>
          </td>
          <td style="padding-left:8px;">
            <a href="${cancelUrl}" style="display:block;padding:12px 0;background:#f8f5ef;border:1px solid #ddd;text-align:center;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#999;text-decoration:none;">${cancelLabel}</a>
          </td>
        </tr>
      </table>`;
  })() : "";

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
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr><td style="background:#1c1c1c;text-align:center;">
              <a href="${calUrl}" style="display:inline-block;padding:14px 32px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                ${calBtn}
              </a>
            </td></tr>
          </table>
          ${cancelBlock}
          <p style="margin:28px 0 6px;font-size:13px;color:#999;line-height:1.8;">
            📍 278 Plandome Rd, 2nd Floor, Manhasset, NY 11030<br/>
            📞 <a href="tel:5169843859" style="color:#C9A84C;text-decoration:none;">(516) 984-3859</a><br/>
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

  const { error } = await getResend().emails.send({
    from:    `Yee Eyelashes <${FROM}>`,
    to:      data.email,
    subject,
    html,
  });
  if (error) throw new Error(`Resend confirmation error: ${JSON.stringify(error)}`);
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
              <a href="${BASE}/admin" style="display:inline-block;padding:14px 32px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
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

  const { error } = await getResend().emails.send({
    from:    `Yee Eyelashes <${FROM}>`,
    to:      bettyEmail,
    subject: `New Booking — ${data.name} · ${data.serviceLabel} on ${formattedDate}`,
    html,
  });
  if (error) throw new Error(`Resend betty error: ${JSON.stringify(error)}`);
}

// ── 3. Cancellation emails ───────────────────────────────────────────────────
export async function sendCancellationEmail(data: BookingEmailData) {
  const formattedDate = formatDate(data.date);
  const zh            = data.lang === "zh";
  const lang          = data.lang ?? "en";
  const rebookUrl     = `${BASE}/${lang}/booking`;

  const subject = zh
    ? `預約已取消 — ${data.serviceLabel}・${formattedDate}`
    : `Appointment Cancelled — ${data.serviceLabel} on ${formattedDate}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8f5ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;max-width:560px;width:100%;">
        <tr><td style="background:#C9A84C;height:4px;"></td></tr>
        <tr><td style="padding:48px 48px 32px;text-align:center;border-bottom:1px solid #f0ece4;">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A84C;">Yee Eyelashes</p>
          <h1 style="margin:0;font-size:26px;font-weight:300;color:#1c1c1c;">${zh ? "預約已取消" : "Appointment Cancelled"}</h1>
        </td></tr>
        <tr><td style="padding:40px 48px;">
          <p style="margin:0 0 24px;font-size:14px;color:#777;line-height:1.8;">
            ${zh ? `您好 ${data.name}，您的預約已成功取消。` : `Hi ${data.name}, your appointment has been successfully cancelled.`}
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;border-left:2px solid #C9A84C;margin-bottom:28px;">
            <tr><td style="padding:24px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row(zh ? "服務" : "Service", data.serviceLabel)}
                ${row(zh ? "日期" : "Date",    formattedDate)}
                ${row(zh ? "時間" : "Time",    data.time)}
              </table>
            </td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
            <tr><td style="background:#1c1c1c;text-align:center;">
              <a href="${rebookUrl}" style="display:inline-block;padding:14px 32px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#fff;text-decoration:none;">
                ${zh ? "重新預約" : "Book Again"}
              </a>
            </td></tr>
          </table>
          <p style="font-size:13px;color:#999;line-height:1.8;">
            📍 278 Plandome Rd, 2nd Floor, Manhasset, NY 11030<br/>
            📞 <a href="tel:5169843859" style="color:#C9A84C;text-decoration:none;">(516) 984-3859</a>
          </p>
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

  const { error } = await getResend().emails.send({
    from: `Yee Eyelashes <${FROM}>`,
    to:   data.email,
    subject,
    html,
  });
  if (error) throw new Error(`Resend cancellation error: ${JSON.stringify(error)}`);
}

export async function sendBettyCancellationNotification(data: BookingEmailData) {
  const bettyEmail    = process.env.BETTY_EMAIL ?? "yeelashesny@gmail.com";
  const formattedDate = formatDate(data.date);

  const { error } = await getResend().emails.send({
    from:    `Yee Eyelashes <${FROM}>`,
    to:      bettyEmail,
    subject: `Booking Cancelled — ${data.name} · ${data.serviceLabel} on ${formattedDate}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f8f5ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;max-width:560px;width:100%;">
        <tr><td style="background:#c0392b;height:4px;"></td></tr>
        <tr><td style="padding:40px 48px 32px;text-align:center;border-bottom:1px solid #f0ece4;">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#c0392b;">Yee Eyelashes</p>
          <h1 style="margin:0;font-size:24px;font-weight:300;color:#1c1c1c;">Booking Cancelled</h1>
        </td></tr>
        <tr><td style="padding:36px 48px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;border-left:2px solid #c0392b;">
            <tr><td style="padding:24px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row("Client",  data.name)}
                ${row("Phone",   data.phone)}
                ${row("Email",   data.email)}
                ${row("Service", data.serviceLabel)}
                ${row("Date",    formattedDate)}
                ${row("Time",    data.time)}
              </table>
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
</html>`,
  });
  if (error) throw new Error(`Resend betty cancel error: ${JSON.stringify(error)}`);
}

// ── 5. Google Review invitation ──────────────────────────────────────────────
export async function sendGoogleReviewEmail(data: {
  name:  string;
  email: string;
}) {
  const reviewUrl = process.env.GOOGLE_REVIEW_URL
    ?? "https://search.google.com/local/writereview?placeid=ChIJ_____YEE_EYELASHES";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8f5ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:560px;width:100%;">
        <tr><td style="background:#C9A84C;height:4px;"></td></tr>
        <tr><td style="padding:48px 48px 32px;text-align:center;border-bottom:1px solid #f0ece4;">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A84C;">Yee Eyelashes</p>
          <h1 style="margin:0;font-size:26px;font-weight:300;color:#1c1c1c;letter-spacing:-0.01em;">How was your experience?</h1>
        </td></tr>
        <tr><td style="padding:40px 48px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef9ec;border:1px solid #f0dfa0;border-radius:6px;margin-bottom:24px;">
            <tr><td style="padding:16px 24px;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#1c1c1c;">🎁 Get $10 off your next visit</p>
              <p style="margin:6px 0 0;font-size:13px;color:#777;line-height:1.7;">Leave us a Google review and receive <strong>$10 off</strong> your next appointment. Just show us your review when you come in!</p>
            </td></tr>
          </table>
          <p style="margin:0 0 24px;font-size:14px;color:#777;line-height:1.9;">
            Hi ${data.name}, thank you so much for visiting Yee Eyelashes! We hope you loved your lashes. ✨
          </p>
          <p style="margin:0 0 28px;font-size:14px;color:#777;line-height:1.9;">
            If you have a moment, we'd truly appreciate a Google review. It helps other clients discover us and means the world to our small business.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
            <tr><td style="background:#1c1c1c;text-align:center;">
              <a href="${reviewUrl}" style="display:inline-block;padding:16px 44px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                Leave a Google Review ★
              </a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#bbb;text-align:center;line-height:1.8;">
            It only takes 30 seconds. We truly appreciate your support!
          </p>
          <p style="margin:28px 0 0;font-size:13px;color:#999;line-height:1.8;">
            📍 278 Plandome Rd, 2F, Manhasset, NY 11030<br/>
            📞 <a href="tel:5169843859" style="color:#C9A84C;text-decoration:none;">(516) 984-3859</a><br/>
            📷 <a href="https://www.instagram.com/yee_lashesny" style="color:#C9A84C;text-decoration:none;">@yee_lashesny</a>
          </p>
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

  const { error } = await getResend().emails.send({
    from:    `Yee Eyelashes <${FROM}>`,
    to:      data.email,
    subject: `${data.name}, we'd love your feedback! — Yee Eyelashes ✨`,
    html,
  });
  if (error) throw new Error(`Resend review email error: ${JSON.stringify(error)}`);
}

// ── 6. 14-day refill reminder (Chinese, sent to client) ─────────────────────
export async function sendRefillReminderEmail(data: {
  name:         string;
  email:        string;
  phone:        string;
  serviceLabel: string;
  lang?:        string;
}) {
  const rebookUrl = "https://square.site/appointments/buyer/widget/qe4tfv3078b5gx/LYH1D5CHJ3Q63";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8f5ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:560px;width:100%;">
        <tr><td style="background:#C9A84C;height:4px;"></td></tr>
        <tr><td style="padding:48px 48px 32px;text-align:center;border-bottom:1px solid #f0ece4;">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A84C;">Yee Eyelashes</p>
          <h1 style="margin:0;font-size:26px;font-weight:300;color:#1c1c1c;letter-spacing:-0.01em;">Time for a Refill!</h1>
        </td></tr>
        <tr><td style="padding:40px 48px;">
          <p style="margin:0 0 24px;font-size:14px;color:#777;line-height:1.9;">
            Hi ${data.name}, it's been two weeks since your last lash appointment. It's the perfect time to come in for a refill and keep your lashes looking full and beautiful!
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;border-left:2px solid #C9A84C;margin-bottom:28px;">
            <tr><td style="padding:24px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row("Last Service", data.serviceLabel)}
                ${row("Recommended", "2-Week Refill")}
              </table>
            </td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr><td style="background:#1c1c1c;text-align:center;">
              <a href="${rebookUrl}" style="display:inline-block;padding:14px 40px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                Book Your Refill
              </a>
            </td></tr>
          </table>
          <p style="font-size:13px;color:#999;line-height:1.8;">
            📍 278 Plandome Rd, 2F, Manhasset, NY 11030<br/>
            📞 <a href="tel:5169843859" style="color:#C9A84C;text-decoration:none;">(516) 984-3859</a><br/>
            📷 <a href="https://www.instagram.com/yee_lashesny" style="color:#C9A84C;text-decoration:none;">@yee_lashesny</a>
          </p>
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

  const { error } = await getResend().emails.send({
    from:    `Yee Eyelashes <${FROM}>`,
    to:      data.email,
    subject: `${data.name}, your lashes are ready for a refill! — Yee Eyelashes`,
    html,
  });
  if (error) throw new Error(`Resend refill reminder error: ${JSON.stringify(error)}`);
}

export async function sendBirthdayEmail(data: { name: string; email: string }) {
  const bookUrl = `${BASE}/en/booking`;
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f5ef;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:560px;width:100%;">
        <tr><td style="background:linear-gradient(90deg,#C9A84C,#e8c97a);height:4px;"></td></tr>
        <tr><td style="padding:48px 48px 32px;text-align:center;border-bottom:1px solid #f0ece4;">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A84C;">Yee Eyelashes</p>
          <h1 style="margin:0;font-size:28px;font-weight:300;color:#1c1c1c;letter-spacing:-0.01em;">🎂 Happy Birthday, ${data.name}!</h1>
        </td></tr>
        <tr><td style="padding:40px 48px;">
          <p style="margin:0 0 24px;font-size:14px;color:#777;line-height:1.9;">
            Wishing you the most beautiful birthday! 🎉 As our way of celebrating with you, enjoy <strong style="color:#1c1c1c;">20% off any service</strong> during your birthday month — because you deserve to feel gorgeous on your special day.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef9ec;border:1px solid #f0dfa0;border-radius:8px;margin-bottom:28px;">
            <tr><td style="padding:24px 28px;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A84C;">Birthday Gift</p>
              <p style="margin:0;font-size:32px;font-weight:700;color:#1c1c1c;">20% OFF</p>
              <p style="margin:6px 0 0;font-size:12px;color:#999;">Valid all month long · No code needed</p>
            </td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
            <tr><td style="background:#1c1c1c;text-align:center;">
              <a href="${bookUrl}" style="display:inline-block;padding:14px 40px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                Book Your Birthday Lashes ✨
              </a>
            </td></tr>
          </table>
          <p style="font-size:13px;color:#999;line-height:1.8;">
            📍 278 Plandome Rd, 2F, Manhasset, NY 11030<br/>
            📞 <a href="tel:5169843859" style="color:#C9A84C;text-decoration:none;">(516) 984-3859</a><br/>
            📷 <a href="https://www.instagram.com/yee_lashesny" style="color:#C9A84C;text-decoration:none;">@yee_lashesny</a>
          </p>
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

  const { error } = await getResend().emails.send({
    from:    `Yee Eyelashes <${FROM}>`,
    to:      data.email,
    subject: `🎂 Happy Birthday, ${data.name}! A gift from Yee Eyelashes 🎁`,
    html,
  });
  if (error) throw new Error(`Resend birthday email error: ${JSON.stringify(error)}`);
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:6px 0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A84C;width:90px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0 6px 16px;font-size:13px;color:#1c1c1c;line-height:1.6;">${value}</td>
    </tr>`;
}
