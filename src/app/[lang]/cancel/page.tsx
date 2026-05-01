import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";
import { supabaseAdmin } from "@/lib/supabase";
import { generateCancelToken } from "@/lib/email";
import CancelClient from "./CancelClient";

type Props = {
  params:       Promise<{ lang: string }>;
  searchParams: Promise<{ id?: string; token?: string }>;
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default async function CancelPage({ params, searchParams }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  const zh   = lang === "zh";

  const { id, token } = await searchParams;

  // Invalid link
  if (!id || !token || token !== generateCancelToken(id)) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: "#C9A84C", marginBottom: 12 }}>
          Yee Eyelashes
        </p>
        <h2 style={{ fontSize: 24, fontWeight: 300, color: "#1c1c1c", marginBottom: 12 }}>
          {zh ? "連結無效" : "Invalid Link"}
        </h2>
        <p style={{ fontSize: 14, color: "#777", lineHeight: 1.8 }}>
          {zh
            ? "此取消連結無效或已過期。請聯絡我們以取消預約。"
            : "This cancellation link is invalid or has expired. Please contact us to cancel your appointment."}
        </p>
        <p style={{ marginTop: 24, fontSize: 13, color: "#999" }}>
          📞 <a href="tel:9298062467" style={{ color: "#C9A84C" }}>929-806-2467</a>
        </p>
      </div>
    );
  }

  // Fetch booking
  const db = supabaseAdmin();
  const { data: booking } = await db
    .from("bookings")
    .select("service_label, date, time, status")
    .eq("id", id)
    .single();

  if (!booking) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#777" }}>
          {zh ? "找不到預約記錄。" : "Booking not found."}
        </p>
      </div>
    );
  }

  if (booking.status === "cancelled") {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: "#C9A84C", marginBottom: 12 }}>
          Yee Eyelashes
        </p>
        <h2 style={{ fontSize: 24, fontWeight: 300, color: "#1c1c1c", marginBottom: 12 }}>
          {zh ? "預約已取消" : "Already Cancelled"}
        </h2>
        <p style={{ fontSize: 14, color: "#777", lineHeight: 1.8 }}>
          {zh ? "此預約已取消。" : "This appointment has already been cancelled."}
        </p>
        <a
          href={`/${lang}/booking`}
          style={{
            display: "inline-block", marginTop: 24, padding: "14px 32px",
            background: "#1c1c1c", color: "#fff",
            fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", textDecoration: "none",
          }}
        >
          {zh ? "重新預約" : "Book Again"}
        </a>
      </div>
    );
  }

  return (
    <CancelClient
      id={id}
      token={token}
      lang={lang}
      serviceLabel={booking.service_label}
      date={formatDate(booking.date)}
      time={booking.time}
      zh={zh}
    />
  );
}
