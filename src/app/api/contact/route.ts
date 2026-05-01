import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FROM        = "booking@yeeeyelashes.com";
const BETTY_EMAIL = process.env.BETTY_EMAIL ?? "yeelashesny@gmail.com";
const getResend   = () => new Resend(process.env.RESEND_API_KEY ?? "placeholder");

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (name.length > 100 || message.length > 2000) return NextResponse.json({ error: "Input too long" }, { status: 400 });

    const resend = getResend();

    // 1. Notify Betty
    await resend.emails.send({
      from:    `Yee Eyelashes <${FROM}>`,
      to:      BETTY_EMAIL,
      subject: `New Message from ${name}`,
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f8f5ef;padding:40px 20px;">
          <div style="max-width:560px;margin:0 auto;background:#fff;">
            <div style="background:#C9A84C;height:4px;"></div>
            <div style="padding:40px 48px;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A84C;">Yee Eyelashes</p>
              <h2 style="margin:0 0 24px;font-size:22px;font-weight:300;color:#1c1c1c;">New Contact Message</h2>
              <table style="width:100%;background:#fafaf8;border-left:2px solid #C9A84C;"><tr><td style="padding:24px 28px;">
                <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A84C;">From</p>
                <p style="margin:0 0 16px;font-size:13px;color:#1c1c1c;">${name} &lt;${email}&gt;</p>
                <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A84C;">Message</p>
                <p style="margin:0;font-size:13px;color:#1c1c1c;line-height:1.8;">${message.replace(/\n/g, "<br/>")}</p>
              </td></tr></table>
              <div style="margin-top:24px;">
                <a href="mailto:${email}" style="display:inline-block;padding:12px 28px;background:#1c1c1c;color:#fff;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;">Reply to ${name}</a>
              </div>
            </div>
            <div style="padding:20px 48px;background:#1c1c1c;text-align:center;">
              <p style="margin:0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#555;">© ${new Date().getFullYear()} Yee Eyelashes · Manhasset, NY</p>
            </div>
          </div>
        </div>`,
    });

    // 2. Confirm to customer
    await resend.emails.send({
      from:    `Yee Eyelashes <${FROM}>`,
      to:      email,
      subject: `We received your message — Yee Eyelashes`,
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f8f5ef;padding:40px 20px;">
          <div style="max-width:560px;margin:0 auto;background:#fff;">
            <div style="background:#C9A84C;height:4px;"></div>
            <div style="padding:48px 48px 40px;text-align:center;border-bottom:1px solid #f0ece4;">
              <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;color:#C9A84C;">Yee Eyelashes</p>
              <h1 style="margin:0;font-size:26px;font-weight:300;color:#1c1c1c;">Message Received</h1>
            </div>
            <div style="padding:40px 48px;">
              <p style="margin:0 0 24px;font-size:14px;color:#777;line-height:1.8;">
                Hi ${name}, thank you for reaching out! We've received your message and will get back to you as soon as possible.
              </p>
              <table style="width:100%;background:#fafaf8;border-left:2px solid #C9A84C;margin-bottom:28px;"><tr><td style="padding:24px 28px;">
                <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A84C;">Your Message</p>
                <p style="margin:0;font-size:13px;color:#1c1c1c;line-height:1.8;">${message.replace(/\n/g, "<br/>")}</p>
              </td></tr></table>
              <p style="font-size:13px;color:#999;line-height:1.8;">
                📍 278 Plandome Rd 2FL, Manhasset, NY 11030<br/>
                📞 <a href="tel:9298062467" style="color:#C9A84C;text-decoration:none;">929-806-2467</a>
              </p>
            </div>
            <div style="padding:20px 48px;background:#1c1c1c;text-align:center;">
              <p style="margin:0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#555;">© ${new Date().getFullYear()} Yee Eyelashes · Manhasset, NY</p>
            </div>
          </div>
        </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
