"use client";

import { useState } from "react";

type Props = {
  id:           string;
  token:        string;
  lang:         string;
  serviceLabel: string;
  date:         string;
  time:         string;
  zh:           boolean;
};

export default function CancelClient({ id, token, lang, serviceLabel, date, time, zh }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleCancel() {
    setState("loading");
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, lang }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrMsg(json.error ?? "Unknown error");
        setState("error");
      } else {
        setState("done");
      }
    } catch {
      setErrMsg("Network error — please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: "#C9A84C", marginBottom: 12 }}>
          Yee Eyelashes
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 300, color: "#1c1c1c", marginBottom: 16 }}>
          {zh ? "預約已取消" : "Appointment Cancelled"}
        </h2>
        <p style={{ fontSize: 14, color: "#777", lineHeight: 1.8, marginBottom: 32 }}>
          {zh
            ? "您的預約已成功取消，確認信已寄至您的信箱。"
            : "Your appointment has been cancelled. A confirmation has been sent to your email."}
        </p>
        <a
          href={zh ? "/zh/booking" : "/en/booking"}
          style={{
            display: "inline-block", padding: "14px 32px",
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
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: "#C9A84C", marginBottom: 12, textAlign: "center" }}>
        Yee Eyelashes
      </p>
      <h2 style={{ fontSize: 26, fontWeight: 300, color: "#1c1c1c", marginBottom: 8, textAlign: "center" }}>
        {zh ? "確認取消預約" : "Cancel Appointment"}
      </h2>
      <p style={{ fontSize: 14, color: "#777", textAlign: "center", marginBottom: 32, lineHeight: 1.8 }}>
        {zh ? "確定要取消以下預約嗎？" : "Are you sure you want to cancel this appointment?"}
      </p>

      <div style={{ background: "#fafaf8", borderLeft: "2px solid #C9A84C", padding: "24px 28px", marginBottom: 32 }}>
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A84C", display: "block", marginBottom: 4 }}>
            {zh ? "服務" : "Service"}
          </span>
          <span style={{ fontSize: 13, color: "#1c1c1c" }}>{serviceLabel}</span>
        </div>
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A84C", display: "block", marginBottom: 4 }}>
            {zh ? "日期" : "Date"}
          </span>
          <span style={{ fontSize: 13, color: "#1c1c1c" }}>{date}</span>
        </div>
        <div>
          <span style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A84C", display: "block", marginBottom: 4 }}>
            {zh ? "時間" : "Time"}
          </span>
          <span style={{ fontSize: 13, color: "#1c1c1c" }}>{time}</span>
        </div>
      </div>

      {state === "error" && (
        <p style={{ fontSize: 13, color: "#c0392b", marginBottom: 16, textAlign: "center" }}>
          {errMsg === "Already cancelled"
            ? (zh ? "此預約已取消。" : "This appointment has already been cancelled.")
            : (zh ? `取消失敗：${errMsg}` : `Error: ${errMsg}`)}
        </p>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <a
          href={zh ? "/zh/booking" : "/en/booking"}
          style={{
            flex: 1, display: "block", padding: "14px 0", textAlign: "center",
            background: "#f0ece4", color: "#1c1c1c",
            fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", textDecoration: "none",
          }}
        >
          {zh ? "保留預約" : "Keep Appointment"}
        </a>
        <button
          onClick={handleCancel}
          disabled={state === "loading"}
          style={{
            flex: 1, padding: "14px 0", border: "1px solid #ddd",
            background: "#fff", color: state === "loading" ? "#bbb" : "#999", cursor: state === "loading" ? "not-allowed" : "pointer",
            fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase",
          }}
        >
          {state === "loading"
            ? (zh ? "取消中…" : "Cancelling…")
            : (zh ? "確認取消" : "Confirm Cancel")}
        </button>
      </div>
    </div>
  );
}
