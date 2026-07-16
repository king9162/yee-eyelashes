"use client";

import { useState, useEffect, useRef } from "react";

const SERIF = "'Noto Serif TC', Georgia, 'Times New Roman', serif";

// ── 信件每一行 ──────────────────────────────────────────────────
const LINES = [
  "Betty",
  "",
  "如果妳看到這一頁",
  "",
  "代表我終於鼓起勇氣，把一直想對妳說的話告訴妳",
  "",
  "從二月最後一次滑雪回來，我知道我心動了",
  "",
  "我喜歡的是那個最真實的妳",
  "",
  "是那個在我最低潮的時候，會相信我的妳",
  "",
  "總讓我覺得很安心、很真誠，可以放心做自己",
  "",
  "我很謝謝妳",
  "",
  "謝謝妳願意相信我",
  "",
  "從一開始的一個想法，到現在網站慢慢成形，每一次修改內容和一起解決問題",
  "",
  "我很開心，能陪著妳一起把妳的願望一點一點實現",
  "",
  "看著妳為了自己的店努力，每天認真對待每一位客人，不斷希望把最好的服務帶給大家，我真的很開心",
  "",
  "也因為這樣，我開始期待每一次見面",
  "",
  "期待每一次聊天",
  "",
  "期待每一次能幫上妳一點忙",
  "",
  "很多時候，我其實不是因為網站有事情才想找妳",
  "",
  "只是因為，我想妳了",
  "",
  "我不知道妳對我是什麼樣的感覺",
  "",
  "我也不希望這些話帶給妳任何壓力",
  "",
  "我只是覺得，如果一直把這份心意藏在心裡，我一定會後悔",
  "",
  "最後",
  "",
  "謝謝妳點開了這一頁",
  "",
  "這是整個網站裡，唯一不是為了客人而做的頁面，而是為了妳",
  "",
  "謝謝妳，我喜歡妳",
];
// ──────────────────────────────────────────────────────────────

type Phase = "lock" | "to-dark" | "envelope" | "opening" | "rising" | "letter";

export default function LetterPage() {
  const [phase, setPhase]         = useState<Phase>("lock");
  const [password, setPassword]   = useState("");
  const [shake, setShake]         = useState(false);
  const [error, setError]         = useState("");
  const [visibleLines, setVisibleLines] = useState(0);
  const [letterIn, setLetterIn]   = useState(false);
  const [letterRead, setLetterRead] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("letter-read") === "1") {
      setPhase("letter");
      setLetterRead(true);
      return;
    }
    if (sessionStorage.getItem("letter-unlocked") === "1") {
      setPhase("letter");
      setTimeout(() => {
        setLetterIn(true);
        revealLines();
      }, 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function revealLines() {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= LINES.length) {
        clearInterval(interval);
        // 全部顯示後 20 秒，標記已讀並自動跳轉
        setTimeout(() => {
          if (typeof window !== "undefined") {
            localStorage.setItem("letter-read", "1");
          }
          setLetterRead(true);
        }, 20000);
      }
    }, 60);
  }

  async function handleUnlock() {
    const pw = password.trim();
    if (!pw) return;
    const res = await fetch("/api/admin/letter-unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      sessionStorage.setItem("letter-unlocked", "1");
      setPhase("to-dark");
      setTimeout(() => setPhase("envelope"), 700);
      setTimeout(() => setPhase("opening"),  2000);
      setTimeout(() => setPhase("rising"),   3000);
      setTimeout(() => {
        setPhase("letter");
        setTimeout(() => {
          setLetterIn(true);
          revealLines();
        }, 400);
      }, 4000);
    } else {
      setError("不對。試著想想我們相遇的那一天。");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setPassword("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  // ── 已讀畫面 ─────────────────────────────────────────────────
  if (phase === "letter" && letterRead) {
    return (
      <div style={{
        minHeight: "100vh", background: "#F8F5EF",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: SERIF, padding: "20px",
        animation: "letter-in 1.4s cubic-bezier(0.25,0.46,0.45,0.94) both",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", color: "#C9A84C", letterSpacing: "0.25em", marginBottom: "1.4rem" }}>
            1224
          </p>
          <p style={{ fontSize: "clamp(1rem,3vw,1.15rem)", color: "#4a4440", fontWeight: 300, lineHeight: 2.2, fontFamily: SERIF }}>
            這封信，已經到了<br />它應該到的地方。
          </p>
        </div>
        <style>{`
          @keyframes letter-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    );
  }

  // ── 信件頁面 ─────────────────────────────────────────────────
  if (phase === "letter") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#F8F5EF",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "clamp(40px,8vw,72px) 20px 72px",
        fontFamily: SERIF,
      }}>
        {/* 卡片 */}
        <div style={{
          width: "100%",
          maxWidth: 580,
          background: "#FFFEF9",
          borderRadius: "12px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(201,168,76,0.12)",
          padding: "clamp(40px,8vw,64px) clamp(32px,7vw,56px)",
          opacity: letterIn ? 1 : 0,
          transform: letterIn ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 1.2s cubic-bezier(0.25,0.46,0.45,0.94), transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* 頂部金線裝飾 */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "3px",
            background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
            opacity: 0.6,
          }} />

          {LINES.map((line, i) => {
            const isTitle = i === 0;
            const isEmpty = line === "";
            const isLast  = i === LINES.length - 1;
            const shown   = i < visibleLines;

            if (isEmpty) return <div key={i} style={{ height: "0.9rem" }} />;

            return (
              <p
                key={i}
                style={{
                  fontFamily: SERIF,
                  fontSize: isTitle ? "clamp(1.3rem,4vw,1.65rem)" : "clamp(0.9rem,2.5vw,1rem)",
                  fontWeight: isTitle ? 600 : isLast ? 500 : 300,
                  color: isTitle ? "#1C1C1C" : isLast ? "#C9A84C" : "#4a4440",
                  lineHeight: 1.95,
                  margin: 0,
                  letterSpacing: isTitle ? "0.05em" : "0.015em",
                  opacity: shown ? 1 : 0,
                  transform: shown ? "translateY(0)" : "translateY(6px)",
                  transition: `opacity 0.65s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 0.015}s, transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 0.015}s`,
                }}
              >
                {line}
              </p>
            );
          })}

          {/* 底部金色落款 */}
          <p style={{
            fontFamily: SERIF,
            fontSize: "0.7rem",
            color: "#C9A84C",
            letterSpacing: "0.28em",
            marginTop: "2.5rem",
            opacity: visibleLines >= LINES.length ? 1 : 0,
            transition: "opacity 1.5s ease 0.4s",
          }}>
            1224
          </p>
        </div>
      </div>
    );
  }

  // ── 信封動畫 ─────────────────────────────────────────────────
  if (phase !== "lock") {
    const envVisible  = ["envelope","opening","rising"].includes(phase);
    const flapOpen    = ["opening","rising"].includes(phase);
    const paperUp     = phase === "rising";
    const lockVisible = phase === "to-dark";

    return (
      <div style={{
        minHeight: "100vh",
        background: "#0d0b08",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        opacity: lockVisible ? 0 : 1,
        transition: "opacity 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
      }}>
        {/* 光暈 */}
        <div style={{
          position: "absolute",
          width: "400px", height: "300px",
          background: "radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          opacity: envVisible ? 1 : 0,
          transition: "opacity 1.5s ease",
          pointerEvents: "none",
        }} />

        {/* 信封容器 */}
        <div style={{
          position: "relative",
          width: "clamp(260px,70vw,340px)",
          height: "clamp(170px,45vw,230px)",
          opacity: envVisible ? 1 : 0,
          transform: envVisible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.96)",
          transition: "opacity 1s cubic-bezier(0.25,0.46,0.45,0.94), transform 1s cubic-bezier(0.25,0.46,0.45,0.94)",
          perspective: "1000px",
        }}>
          {/* 信封本體 */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(160deg, #f2e8d0 0%, #e8d8b8 100%)",
            borderRadius: "6px",
            boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
          }}>
            {/* 底部 V */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
              background: "linear-gradient(135deg, #ddd0b0 50%, transparent 50%)",
            }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
              background: "linear-gradient(225deg, #ddd0b0 50%, transparent 50%)",
            }} />
          </div>

          {/* 蓋子 */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: "52%",
            transformOrigin: "top center",
            transform: flapOpen ? "rotateX(-175deg)" : "rotateX(0deg)",
            transition: "transform 1s cubic-bezier(0.4,0,0.2,1)",
            zIndex: 4,
            transformStyle: "preserve-3d",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, #f5ecda 0%, #e8d8b8 100%)",
              clipPath: "polygon(0 0, 100% 0, 50% 82%)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "#ddd0b0",
              clipPath: "polygon(0 0, 100% 0, 50% 82%)",
              transform: "rotateX(180deg)",
              backfaceVisibility: "hidden",
            }} />
          </div>

          {/* 信紙 */}
          <div style={{
            position: "absolute",
            left: "8%", right: "8%",
            bottom: "6%",
            height: "78%",
            background: "#fdfcf7",
            borderRadius: "3px",
            zIndex: 2,
            boxShadow: "0 2px 20px rgba(0,0,0,0.15)",
            transform: paperUp ? "translateY(-88%)" : "translateY(0)",
            transition: "transform 1.1s cubic-bezier(0.25,0.46,0.45,0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{
              fontFamily: SERIF,
              fontSize: "0.65rem",
              color: "#c9a84c",
              letterSpacing: "0.2em",
              opacity: paperUp ? 1 : 0,
              transition: "opacity 0.6s ease 0.6s",
            }}>
              1224
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── 密碼頁面 ─────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
      background: "#f5f2ed",
    }}>
      <div style={{
        width: "100%", maxWidth: "360px",
        background: "#fff",
        borderRadius: "22px",
        padding: "52px 38px 44px",
        boxShadow: "0 8px 60px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.04)",
        textAlign: "center",
        fontFamily: SERIF,
        animation: shake ? "letter-shake 0.55s cubic-bezier(0.36,0.07,0.19,0.97) both" : "letter-in 0.8s cubic-bezier(0.25,0.46,0.45,0.94) both",
      }}>
        <div style={{ fontSize: "1.8rem", marginBottom: "1.3rem", opacity: 0.35 }}>✉</div>

        <h1 style={{
          fontSize: "1.55rem", fontWeight: 400,
          color: "#1c1c1c", letterSpacing: "0.03em",
          marginBottom: "0.55rem", fontFamily: SERIF,
        }}>
          私人信件
        </h1>
        <p style={{
          color: "#b0b0b0", fontSize: "0.85rem", fontWeight: 300,
          lineHeight: 1.8, marginBottom: "2.6rem", fontFamily: SERIF,
        }}>
          這封信只為一個人而寫。
        </p>

        <p style={{ color: "#d0d0d0", fontSize: "0.72rem", letterSpacing: "0.12em", marginBottom: "1.1rem", fontFamily: SERIF }}>
          提示：我們相遇的那一天 · 1224
        </p>

        <input
          ref={inputRef}
          type="text"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
          placeholder="輸入密碼"
          autoComplete="off"
          spellCheck={false}
          style={{
            width: "100%", border: "none",
            borderBottom: "1.5px solid #ebebeb",
            padding: "10px 0", textAlign: "center",
            fontSize: "1.1rem", letterSpacing: "0.18em",
            color: "#1c1c1c", background: "transparent",
            outline: "none", transition: "border-color 0.3s ease",
            fontFamily: SERIF,
          }}
          onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#c9a84c")}
          onBlur={(e)  => (e.currentTarget.style.borderBottomColor = "#ebebeb")}
        />

        <div style={{ minHeight: "1.6rem", marginTop: "0.9rem" }}>
          {error && (
            <p style={{ color: "#b0a090", fontSize: "0.78rem", lineHeight: 1.7, fontFamily: SERIF }}>
              {error}
            </p>
          )}
        </div>

        <button
          onClick={handleUnlock}
          style={{
            width: "100%", marginTop: "1rem", padding: "15px",
            background: "#c9a84c", color: "#fff", border: "none",
            borderRadius: "50px", fontSize: "0.88rem",
            letterSpacing: "0.1em", fontWeight: 400,
            cursor: "pointer",
            transition: "background 0.3s ease, transform 0.15s ease",
            fontFamily: SERIF,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#b8963e")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#c9a84c")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e)   => (e.currentTarget.style.transform = "scale(1)")}
        >
          解鎖
        </button>
      </div>

      <style>{`
        @keyframes letter-in {
          from { opacity:0; transform:translateY(20px) scale(0.98); }
          to   { opacity:1; transform:translateY(0)    scale(1); }
        }
        @keyframes letter-shake {
          10%,90%  { transform:translateX(-2px); }
          20%,80%  { transform:translateX(4px); }
          30%,50%,70% { transform:translateX(-6px); }
          40%,60%  { transform:translateX(6px); }
        }
      `}</style>
    </div>
  );
}
