"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function RecoveryRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.hash.includes("type=recovery")) return;
    // Initialize Supabase so it auto-processes the hash and establishes the session
    getSupabase();
    router.replace("/member/reset-password");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
