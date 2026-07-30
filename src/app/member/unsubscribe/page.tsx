"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

function UnsubscribeHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const id  = searchParams.get("id");
    const sig = searchParams.get("sig");
    if (!id || !sig) { setStatus("error"); return; }

    fetch(`/api/member/unsubscribe?id=${encodeURIComponent(id)}&sig=${encodeURIComponent(sig)}`)
      .then(r => setStatus(r.ok ? "success" : "error"))
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <div className="w-full max-w-[380px] text-center">
      <div className="flex justify-center mb-8">
        <Image src="/images/yee-logo-v1-cropped.png" alt="Yee Eyelashes" width={140} height={56} className="object-contain" />
      </div>

      {status === "loading" && (
        <>
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
          <p className="text-[13px] text-neutral-400">Processing…</p>
        </>
      )}

      {status === "success" && (
        <>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: "#C9A84C" }}>Unsubscribed</p>
          <h1 className="text-[32px] font-light text-[#1C1C1C] mb-3" style={{ fontFamily: "var(--font-cormorant)" }}>
            You&apos;ve been removed
          </h1>
          <p className="text-[13px] text-neutral-500 leading-relaxed mb-8">
            You&apos;ll no longer receive marketing emails from Yee Eyelashes.<br />
            Appointment confirmations and reminders are unaffected.
          </p>
          <button
            onClick={() => router.push("/member/profile")}
            className="px-6 py-3 rounded-xl text-[12px] font-semibold text-neutral-500 border border-neutral-200 hover:border-[#C9A84C] transition-all"
          >
            Manage All Preferences →
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-3 text-red-400">Error</p>
          <h1 className="text-[28px] font-light text-[#1C1C1C] mb-3" style={{ fontFamily: "var(--font-cormorant)" }}>
            Invalid link
          </h1>
          <p className="text-[13px] text-neutral-500 leading-relaxed mb-8">
            This unsubscribe link is invalid or has expired.<br />
            You can manage your preferences in your profile settings.
          </p>
          <button
            onClick={() => router.push("/member/profile")}
            className="px-6 py-3 rounded-xl text-[12px] font-semibold text-white transition-all"
            style={{ background: "#1C1C1C" }}
          >
            Go to Profile Settings
          </button>
        </>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-[#F8F5EF] flex flex-col items-center justify-center px-4"
      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      <Suspense fallback={
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
      }>
        <UnsubscribeHandler />
      </Suspense>
    </div>
  );
}
