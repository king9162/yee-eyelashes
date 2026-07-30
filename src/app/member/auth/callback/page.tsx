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
      const code = params.get("code");
      if (!code) {
        router.replace("/member/login");
        return;
      }

      const supabase = getSupabase();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.session) {
        router.replace("/member/login");
        return;
      }

      try {
        await fetch("/api/member/ensure-profile", {
          method: "POST",
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
      } catch {
        // Non-fatal
      }

      router.replace("/member/dashboard");
    }

    exchange();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[13px] text-neutral-400 font-montserrat">登入中…</p>
      </div>
      <Suspense>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
