"use client";

import { useState } from "react";
import { Lang, getTranslations } from "@/i18n";
import { contact } from "@/data/contact";
import SectionTitle from "@/components/ui/SectionTitle";

type Props = {
  lang: Lang;
};

export default function ContactSection({ lang }: Props) {
  const t = getTranslations(lang);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError(lang === "zh" ? "發送失敗，請稍後再試。" : "Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const infoItems = [
    {
      label: t.contact.address_label,
      value: `${contact.addressLine1}, ${contact.addressLine2}`,
      note: lang === "zh" ? "路邊停車位可用" : "Street parking available",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      ),
    },
    {
      label: t.contact.phone_label,
      value: `${contact.phone} / ${contact.phone2}`,
      href: `tel:${contact.phone}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
        </svg>
      ),
    },
    {
      label: "Instagram",
      value: contact.instagram,
      href: contact.instagramUrl,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A84C">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="py-14 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <SectionTitle
          heading={t.contact.heading}
          subheading={t.contact.subheading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Info */}
          <div>
            <div className="space-y-8 mb-12">
              {infoItems.map((item) => (
                <div key={item.label} className="flex gap-5">
                  <div className="w-9 h-9 border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-1.5">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-neutral-700 text-sm hover:text-[#C9A84C] transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-neutral-700 text-sm">{item.value}</p>
                    )}
                    {"note" in item && item.note && (
                      <p className="text-[11px] text-neutral-400 mt-1">{item.note}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Hours — same spacing as infoItems */}
              <div className="flex gap-5">
                <div className="w-9 h-9 border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-1.5">
                    {lang === "zh" ? "營業時間" : "Hours"}
                  </p>
                  <div className="space-y-1">
                    {contact.hours.map((row) => (
                      <div key={row.days} className="flex gap-4 text-sm text-neutral-700">
                        <span className="w-28 flex-shrink-0">
                          {lang === "zh" ? row.daysZh : row.days}
                        </span>
                        <span>{row.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps embed */}
            <div className="w-full h-56 sm:h-72 md:h-80 overflow-hidden border border-neutral-200/60">
              <iframe
                src="https://maps.google.com/maps?q=Yee+Eyelashes+278+Plandome+Rd+Manhasset+NY+11030&output=embed&hl=en"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Yee Eyelashes location"
              />
            </div>
          </div>

          {/* Form */}
          <div>
            {submitted ? (
              <div className="flex items-center justify-center h-full min-h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border border-[#C9A84C] flex items-center justify-center mx-auto mb-5">
                    <span className="text-[#C9A84C] text-lg">✓</span>
                  </div>
                  <h3
                    className="text-neutral-800 text-2xl font-light mb-2"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {lang === "zh" ? "訊息已發送！" : "Message Sent"}
                  </h3>
                  <p className="text-neutral-400 text-sm">
                    {lang === "zh" ? "我們將盡快回覆您。" : "We'll get back to you shortly."}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-7">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2.5">
                    {t.contact.form.name}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-b border-neutral-200 py-3 text-sm text-neutral-800 focus:outline-none focus:border-[#C9A84C] transition-colors bg-transparent placeholder:text-neutral-300"
                    placeholder={t.contact.form.name}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2.5">
                    {t.contact.form.email}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border-b border-neutral-200 py-3 text-sm text-neutral-800 focus:outline-none focus:border-[#C9A84C] transition-colors bg-transparent placeholder:text-neutral-300"
                    placeholder={t.contact.form.email}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-400 mb-2.5">
                    {t.contact.form.message}
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full border-b border-neutral-200 py-3 text-sm text-neutral-800 focus:outline-none focus:border-[#C9A84C] transition-colors resize-none bg-transparent placeholder:text-neutral-300"
                    placeholder={t.contact.form.message}
                  />
                </div>
                {error && <p className="text-[12px] text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-900 text-white text-[10px] uppercase tracking-[0.25em] py-4 font-medium hover:bg-[#C9A84C] hover:text-black transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (lang === "zh" ? "發送中..." : "Sending...") : t.contact.form.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
