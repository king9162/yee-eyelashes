import crypto from "crypto";

const secret = () => process.env.ADMIN_SECRET_KEY ?? "";
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function generateResetToken(userId: string): string {
  const exp = Date.now() + EXPIRY_MS;
  const payload = Buffer.from(JSON.stringify({ id: userId, exp })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyResetToken(token: string): string | null {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
    if (sig !== expected) return null;
    const { id, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!id || !exp || Date.now() > exp) return null;
    return id as string;
  } catch {
    return null;
  }
}
