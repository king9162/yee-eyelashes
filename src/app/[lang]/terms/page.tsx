import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return lang === "zh"
    ? { title: "服務條款 | YEE EYELASHES", robots: { index: false } }
    : { title: "Terms of Service | YEE EYELASHES", robots: { index: false } };
}

export default async function TermsPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  if (lang === "zh") return <ZhTerms />;
  return <EnTerms />;
}

const sectionHead = "text-[10px] uppercase tracking-[0.45em] text-[#1C1C1C] mb-5 mt-2";
const subHead = "text-[12.5px] text-[#1C1C1C] font-medium mb-2 mt-6";
const bar = "list-none space-y-2 pl-5 border-l border-neutral-100 my-4";
const gold = "text-[#C9A84C] hover:underline";

/* ─── English ──────────────────────────────────────────────── */
function EnTerms() {
  return (
    <div className="pt-[76px] md:pt-[130px] bg-white">
      <div className="max-w-[720px] mx-auto px-6 sm:px-10 py-20 md:py-28">

        <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C] mb-6">Legal</p>
        <h1 className="text-[2.6rem] md:text-[3.5rem] font-light text-[#1C1C1C] leading-tight mb-3"
          style={{ fontFamily: "var(--font-serif)" }}>
          Terms of Service
        </h1>
        <p className="text-[11px] text-neutral-300 tracking-[0.05em] mb-14 uppercase">
          Last Updated: April 2026
        </p>

        <div className="space-y-10 text-[13.5px] text-neutral-500 leading-[1.9] tracking-[0.01em]">

          {/* Intro */}
          <section>
            <p>
              These Terms of Service ("Agreement") govern your access to and use of the website and
              services operated by Yee Eyelashes ("we," "our," or "us"), located at 278 Plandome Rd,
              2nd Floor, Manhasset, NY 11030. By accessing our website, booking an appointment, or
              receiving any service at our studio, you agree to be bound by this Agreement in full.
              If you do not agree, please do not use our website or services.
            </p>
          </section>

          {/* A */}
          <section>
            <h2 className={sectionHead}>A. General Terms</h2>

            <h3 className={subHead}>Updates to This Agreement</h3>
            <p>
              We reserve the right to modify these Terms of Service at any time without prior notice.
              Changes will be posted on this page with an updated "Last Updated" date. Your continued
              use of our website or services after any changes constitutes your acceptance of the
              revised Agreement. We encourage you to review these Terms periodically.
            </p>

            <h3 className={subHead}>Accuracy of Information</h3>
            <p>
              We take reasonable care to ensure that all service descriptions, pricing, and content
              on our website are accurate and current. However, we do not warrant that all content is
              free from errors or omissions. We reserve the right to correct any inaccuracies at any
              time without prior notice.
            </p>
          </section>

          {/* B */}
          <section>
            <h2 className={sectionHead}>B. Services</h2>
            <p>
              Yee Eyelashes provides professional eyelash extension, lash lift, tinting, and permanent
              makeup (PMU) services performed by trained and experienced lash artists. All services are
              cosmetic in nature and are not intended as medical treatment or advice.
            </p>
            <p className="mt-4">
              Results may vary depending on individual lash characteristics, skin type, lifestyle, and
              adherence to aftercare instructions. We do not guarantee specific outcomes.
            </p>
            <p className="mt-4">
              Service pricing is as listed on our website and is subject to change. Price adjustments
              may apply for upgrades to premium lash materials or styles, as noted in our service menu.
            </p>
          </section>

          {/* C */}
          <section>
            <h2 className={sectionHead}>C. Appointments & Booking</h2>

            <h3 className={subHead}>Booking</h3>
            <p>
              Appointments may be booked through our website, by phone, or via direct message on
              our social media channels. Bookings are subject to availability and are confirmed only
              upon receipt of confirmation from Yee Eyelashes.
            </p>

            <h3 className={subHead}>Late Arrivals</h3>
            <p>
              Please arrive on time for your scheduled appointment. Arrivals more than 10 minutes
              late may result in a shortened service or require rescheduling, at the discretion of
              the lash artist.
            </p>

            <h3 className={subHead}>Cancellations & Rescheduling</h3>
            <p>
              We kindly ask that you provide at least 24 hours' notice if you need to cancel or
              reschedule your appointment. Repeated no-shows or late cancellations may result in
              a deposit requirement for future bookings.
            </p>
          </section>

          {/* D */}
          <section>
            <h2 className={sectionHead}>D. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Yee Eyelashes shall not be liable
              for any indirect, incidental, special, or consequential damages arising out of or
              in connection with your use of our website or services, including but not limited to
              allergic reactions resulting from undisclosed sensitivities, dissatisfaction with
              results due to natural lash limitations, or damages resulting from failure to follow
              aftercare instructions.
            </p>
            <p className="mt-4">
              Our total liability for any claim arising out of or relating to these Terms or our
              services shall not exceed the amount paid by you for the specific service giving rise
              to the claim.
            </p>
          </section>

          {/* E */}
          <section>
            <h2 className={sectionHead}>E. Intellectual Property</h2>
            <p>
              All content on this website, including but not limited to text, images, graphics,
              logos, and design, is the property of Yee Eyelashes or its content suppliers and
              is protected by applicable intellectual property laws. You may not reproduce,
              distribute, or create derivative works from any content on this site without
              our prior written consent.
            </p>
          </section>

          {/* F */}
          <section>
            <h2 className={sectionHead}>F. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className={bar}>
              <li>Use our website for any unlawful purpose or in violation of these Terms</li>
              <li>Attempt to gain unauthorized access to any part of our website or systems</li>
              <li>Transmit any harmful, offensive, or disruptive content through our website or communications</li>
              <li>Misrepresent your identity or provide false information when booking a service</li>
            </ul>
          </section>

          {/* G */}
          <section>
            <h2 className={sectionHead}>G. Third-Party Links & Services</h2>
            <p>
              Our website may contain links to third-party websites or services, including booking
              platforms and social media channels. These links are provided for convenience only.
              We have no control over, and assume no responsibility for, the content or practices
              of any third-party websites.
            </p>
          </section>

          {/* H */}
          <section>
            <h2 className={sectionHead}>H. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws
              of the State of New York, without regard to its conflict of law provisions. Any disputes
              arising under this Agreement shall be subject to the exclusive jurisdiction of the state
              and federal courts located in Nassau County, New York.
            </p>
          </section>

          {/* I */}
          <section>
            <h2 className={sectionHead}>I. No Refund Policy</h2>
            <p>
              All sales are final. We do not offer refunds for completed services. If you have any
              concerns regarding the outcome of your service, please contact us within 48 hours of
              your appointment and we will do our best to address the issue at no additional charge.
            </p>
          </section>

          {/* J */}
          <section>
            <h2 className={sectionHead}>J. Photography & Marketing Consent</h2>
            <p>
              We may wish to photograph or record your lash results for portfolio and marketing
              purposes, including use on our website, Instagram, and other social media platforms.
              We will always ask for your permission before taking any photos or videos. No photos
              will be taken or shared without your explicit consent.
            </p>
            <p className="mt-4">
              No personally identifying information (such as your full name or face) will be shared
              without your additional consent. You may decline at any time, and your preference will
              be fully respected.
            </p>
          </section>

          {/* K */}
          <section>
            <h2 className={sectionHead}>K. Contact Us</h2>
            <p>If you have any questions regarding these Terms of Service, please contact us:</p>
            <div className="mt-5 pl-5 border-l border-[#C9A84C]/30 space-y-1.5">
              <p className="text-[#1C1C1C] font-medium">Yee Eyelashes</p>
              <p>278 Plandome Rd, 2nd Floor, Manhasset, NY 11030</p>
              <p><a href="tel:9298062467" className={gold}>929-806-2467</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

/* ─── Chinese ──────────────────────────────────────────────── */
function ZhTerms() {
  return (
    <div className="pt-[76px] md:pt-[130px] bg-white">
      <div className="max-w-[720px] mx-auto px-6 sm:px-10 py-20 md:py-28">

        <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C] mb-6">法律條款</p>
        <h1 className="text-[2.6rem] md:text-[3.5rem] font-light text-[#1C1C1C] leading-tight mb-3"
          style={{ fontFamily: "var(--font-serif)" }}>
          服務條款
        </h1>
        <p className="text-[11px] text-neutral-300 tracking-[0.05em] mb-14 uppercase">
          最後更新：2026 年 4 月
        </p>

        <div className="space-y-10 text-[13.5px] text-neutral-500 leading-[1.9] tracking-[0.01em]">

          <section>
            <p>
              本服務條款（「本協議」）規範您對 Yee Eyelashes（「我們」）網站及服務的使用。
              我們位於 278 Plandome Rd, 2nd Floor, Manhasset, NY 11030。透過瀏覽本網站、預約或接受任何服務，
              即表示您同意受本協議全部條款約束。如不同意，請勿使用本網站或服務。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>A. 一般條款</h2>
            <h3 className={subHead}>條款更新</h3>
            <p>我們保留隨時修改本服務條款的權利，恕不另行通知。更新後的版本將在本頁面發布並更新日期。在修改後繼續使用本網站或服務，即視為接受修訂後的條款。</p>
            <h3 className={subHead}>資訊準確性</h3>
            <p>我們盡力確保網站上的服務說明、價格及內容準確無誤，但不保證所有內容完全無誤。我們保留隨時更正任何錯誤的權利。</p>
          </section>

          <section>
            <h2 className={sectionHead}>B. 服務說明</h2>
            <p>Yee Eyelashes 由專業技師提供睫毛嫁接、睫毛燙翹、染色及半永久彩妝（PMU）等美容服務，所有服務均屬美容性質，非醫療服務或建議。</p>
            <p className="mt-4">服務效果因個人睫毛狀況、膚質、生活習慣及護理情況而異，我們不保證特定結果。如升級高級睫毛材質或特殊造型，價格可能有所調整。</p>
          </section>

          <section>
            <h2 className={sectionHead}>C. 預約與排程</h2>
            <h3 className={subHead}>預約方式</h3>
            <p>您可透過本網站、電話或社群媒體私訊預約。預約須待 Yee Eyelashes 確認後方為有效。</p>
            <h3 className={subHead}>遲到處理</h3>
            <p>請準時到達。遲到超過 10 分鐘可能導致服務時間縮短或需重新安排，由技師視情況決定。</p>
            <h3 className={subHead}>取消與改期</h3>
            <p>如需取消或更改預約，請至少提前 24 小時通知。多次無故缺席或臨時取消者，未來預約可能需繳交訂金。</p>
          </section>

          <section>
            <h2 className={sectionHead}>D. 責任限制</h2>
            <p>在適用法律允許的最大範圍內，Yee Eyelashes 對因使用本網站或服務而引起的任何間接、附帶或衍生損害概不負責，包括因未告知過敏史引起的反應、因天然睫毛條件限制導致的效果差異，或因未遵循護理指引造成的後果。</p>
            <p className="mt-4">我們就任何索賠的總責任，不超過您為引起該索賠之具體服務所支付的金額。</p>
          </section>

          <section>
            <h2 className={sectionHead}>E. 知識產權</h2>
            <p>本網站上所有內容，包括文字、圖像、商標及設計，均為 Yee Eyelashes 或其內容提供商的財產，受相關知識產權法律保護。未經書面許可，不得複製、傳播或以任何形式使用本網站內容。</p>
          </section>

          <section>
            <h2 className={sectionHead}>F. 使用者行為規範</h2>
            <p>您同意不得：</p>
            <ul className={bar}>
              <li>將本網站用於任何違法目的或違反本條款的行為</li>
              <li>嘗試未經授權存取本網站或系統的任何部分</li>
              <li>透過本網站傳送任何有害、冒犯或干擾性的內容</li>
              <li>在預約時提供虛假身份或不實資訊</li>
            </ul>
          </section>

          <section>
            <h2 className={sectionHead}>G. 第三方連結與服務</h2>
            <p>本網站可能包含第三方網站的連結，這些連結僅供參考。我們對任何第三方網站的內容或做法不承擔任何責任。</p>
          </section>

          <section>
            <h2 className={sectionHead}>H. 適用法律</h2>
            <p>本服務條款受紐約州法律管轄。因本協議引起的任何爭議，應提交至位於紐約州拿騷郡的法院管轄。</p>
          </section>

          <section>
            <h2 className={sectionHead}>I. 退款政策</h2>
            <p>所有服務費用概不退款。若您對服務結果有任何疑慮，請於預約後 48 小時內聯絡我們，我們將盡力免費為您處理相關問題。</p>
          </section>

          <section>
            <h2 className={sectionHead}>J. 攝影與行銷授權</h2>
            <p>
              我們可能希望拍攝您的睫毛效果照片或影片，用於作品集及行銷用途，包括本網站、Instagram 及其他社群媒體平台。
              在拍攝任何照片或影片之前，我們都會事先徵得您的同意。未經您明確授權，我們不會拍攝或分享任何內容。
            </p>
            <p className="mt-4">
              未經您額外同意，我們不會公開任何可識別個人身份的資訊（如全名或正面照片）。您可以隨時拒絕，我們將完全尊重您的意願。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>K. 聯絡我們</h2>
            <p>如對本服務條款有任何疑問，請聯絡我們：</p>
            <div className="mt-5 pl-5 border-l border-[#C9A84C]/30 space-y-1.5">
              <p className="text-[#1C1C1C] font-medium">Yee Eyelashes</p>
              <p>278 Plandome Rd, 2nd Floor, Manhasset, NY 11030</p>
              <p><a href="tel:9298062467" className="text-[#C9A84C] hover:underline">929-806-2467</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
