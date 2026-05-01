import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "#1C1C1C",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle gold diagonal accent */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, transparent 60%)",
          display: "flex",
        }} />

        {/* Gold top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#C9A84C", display: "flex" }} />
        {/* Gold bottom bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", background: "#C9A84C", display: "flex" }} />
        {/* Gold left bar */}
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "4px", background: "#C9A84C", display: "flex" }} />
        {/* Gold right bar */}
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "4px", background: "#C9A84C", display: "flex" }} />

        {/* Left content */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 0 80px 90px",
          flex: 1,
          gap: "0px",
        }}>
          {/* Eyebrow */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}>
            <div style={{ width: "32px", height: "1px", background: "#C9A84C", display: "flex" }} />
            <div style={{ fontSize: "12px", letterSpacing: "0.5em", color: "#C9A84C", textTransform: "uppercase" }}>
              Manhasset, New York
            </div>
          </div>

          {/* Studio name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "40px" }}>
            <div style={{ fontSize: "72px", fontWeight: 300, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1, display: "flex" }}>
              Yee
            </div>
            <div style={{ fontSize: "72px", fontWeight: 300, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1, display: "flex" }}>
              Eyelashes
            </div>
          </div>

          {/* Services */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {["Lash Extensions", "Lash Lift & Tint", "Permanent Makeup"].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#C9A84C", display: "flex" }} />
                <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em" }}>{s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Logo */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 90px 80px 40px",
          width: "380px",
          flexShrink: 0,
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.yeeeyelashes.com/images/yee-logo-v1-cropped.png"
            width={260}
            height={87}
            style={{ objectFit: "contain", opacity: 0.9 }}
            alt="Yee Eyelashes"
          />
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
