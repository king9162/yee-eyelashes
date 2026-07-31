"use client";
import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function exchange() {
      const supabase = getSupabase();
      const code = params.get("code");

      // Check for recovery type in hash BEFORE Supabase clears it
      const hashStr = typeof window !== "undefined" ? window.location.hash : "";
      const isRecovery = hashStr.includes("type=recovery");

      if (code) {
        // PKCE flow: exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !data.session) {
          console.error("PKCE exchange failed:", error?.message);
          router.replace("/member/login");
          return;
        }
        if (isRecovery) {
          router.replace("/member/reset-password");
          return;
        }
        const isNew = await ensureProfile(data.session.access_token);
        router.replace(isNew ? "/member/onboarding" : "/member/dashboard");
        return;
      }

      // Implicit flow: session arrives via URL hash (#access_token=...)
      // The Supabase client auto-processes the hash on init — just wait and read it
      await new Promise((r) => setTimeout(r, 800));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/member/login");
        return;
      }
      if (isRecovery) {
        router.replace("/member/reset-password");
        return;
      }
      const isNew2 = await ensureProfile(session.access_token);
      router.replace(isNew2 ? "/member/onboarding" : "/member/dashboard");
    }

    exchange();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

async function ensureProfile(token: string): Promise<boolean> {
  try {
    const res = await fetch("/api/member/ensure-profile", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    return d.created === true;
  } catch {
    return false;
  }
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }}
        />
        <p className="text-[13px] text-neutral-400" style={{ fontFamily: "var(--font-montserrat)" }}>
          Signing in…
        </p>
      </div>
      <Suspense>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
