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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8F5EF",
          position: "relative",
        }}
      >
        {/* Gold top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: "#C9A84C", display: "flex" }} />
        {/* Gold bottom bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "6px", background: "#C9A84C", display: "flex" }} />

        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://www.yeelashesny.com/images/yee-logo-og.png"
          width={320}
          height={320}
          style={{ objectFit: "contain", marginBottom: "8px" }}
          alt="Yee Eyelashes"
        />

        {/* Tagline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div style={{ fontSize: "18px", letterSpacing: "0.4em", color: "#C9A84C", textTransform: "uppercase" }}>
            Premier Lash Studio
          </div>
          <div style={{ fontSize: "15px", letterSpacing: "0.2em", color: "#999", textTransform: "uppercase" }}>
            Manhasset, New York
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
