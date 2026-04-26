"use client";

import { useEffect } from "react";

export default function DisableCopy() {
  useEffect(() => {
    // ── 1. Disable right-click ──────────────────────────────
    const noContext = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", noContext);

    // ── 2. Disable keyboard shortcuts ───────────────────────
    const noKeys = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (
        (ctrl && ["u", "s", "p"].includes(e.key.toLowerCase())) ||
        (ctrl && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", noKeys);

    // ── 3. Disable image dragging ────────────────────────────
    const nodrag = (e: DragEvent) => e.preventDefault();
    document.addEventListener("dragstart", nodrag);

    // ── 4. Disable text selection on non-interactive elements
    const noSelect = (e: Event) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (!["input", "textarea", "select", "a", "button"].includes(tag)) {
        e.preventDefault();
      }
    };
    document.addEventListener("selectstart", noSelect);

    // ── 5. Console warning (like Facebook) ──────────────────
    console.log(
      "%c⚠ STOP!",
      "color:#C9A84C;font-size:52px;font-weight:900;-webkit-text-stroke:2px black;"
    );
    console.log(
      "%cThis is a private website. Unauthorized copying or scraping is prohibited.\n© Yee Eyelashes. All rights reserved.",
      "color:#1c1c1c;font-size:14px;line-height:1.8;"
    );

    // ── 6. DevTools detection → blur page (desktop only) ────
    // Skip on mobile: browser UI chrome (address bar, home indicator) easily
    // exceeds the threshold, causing false positives.
    const isMobile =
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      navigator.maxTouchPoints > 1;

    let devtoolsOpen = false;
    let devtoolsInterval: ReturnType<typeof setInterval> | null = null;

    if (!isMobile) {
      const checkDevTools = () => {
        const threshold = 160;
        const widthOpen  = window.outerWidth  - window.innerWidth  > threshold;
        const heightOpen = window.outerHeight - window.innerHeight > threshold;

        if ((widthOpen || heightOpen) && !devtoolsOpen) {
          devtoolsOpen = true;
          document.body.style.filter = "blur(8px)";
          document.body.style.userSelect = "none";
          const overlay = document.createElement("div");
          overlay.id = "devtools-overlay";
          overlay.style.cssText = `
            position:fixed;inset:0;z-index:99999;
            display:flex;flex-direction:column;
            align-items:center;justify-content:center;
            background:rgba(28,28,28,0.85);
            color:#C9A84C;font-family:sans-serif;text-align:center;
          `;
          overlay.innerHTML = `
            <div style="font-size:48px;margin-bottom:16px;">🔒</div>
            <div style="font-size:22px;font-weight:700;letter-spacing:0.1em;margin-bottom:12px;">ACCESS RESTRICTED</div>
            <div style="font-size:13px;color:#aaa;max-width:320px;line-height:1.8;">
              Developer tools are not allowed on this site.<br/>Please close DevTools to continue.
            </div>
          `;
          document.body.appendChild(overlay);
        } else if (!widthOpen && !heightOpen && devtoolsOpen) {
          devtoolsOpen = false;
          document.body.style.filter = "";
          document.body.style.userSelect = "";
          const overlay = document.getElementById("devtools-overlay");
          if (overlay) overlay.remove();
        }
      };

      devtoolsInterval = setInterval(checkDevTools, 2000);
    }

    return () => {
      document.removeEventListener("contextmenu", noContext);
      document.removeEventListener("keydown", noKeys);
      document.removeEventListener("dragstart", nodrag);
      document.removeEventListener("selectstart", noSelect);
      if (devtoolsInterval) clearInterval(devtoolsInterval);
    };
  }, []);

  return null;
}
