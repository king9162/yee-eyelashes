import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang, type Lang } from "@/i18n";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return lang === "zh"
    ? { title: "隱私政策 | YEE EYELASHES", robots: { index: false } }
    : { title: "Privacy Policy | YEE EYELASHES", robots: { index: false } };
}

export default async function PrivacyPage({ params }: Props) {
  const { lang: rawLang } = await params;
  if (!isValidLang(rawLang)) notFound();
  const lang = rawLang as Lang;
  if (lang === "zh") return <ZhPolicy />;
  return <EnPolicy />;
}

const sectionHead = "text-[10px] uppercase tracking-[0.45em] text-[#1C1C1C] mb-5 mt-2";
const subHead = "text-[12.5px] text-[#1C1C1C] font-medium mb-2 mt-6";
const bar = "list-none space-y-2 pl-5 border-l border-neutral-100 my-4";
const gold = "text-[#C9A84C] hover:underline";

/* ─── English ──────────────────────────────────────────────── */
function EnPolicy() {
  return (
    <div className="pt-[76px] md:pt-[130px] bg-white">
      <div className="max-w-[720px] mx-auto px-6 sm:px-10 py-20 md:py-28">

        <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C] mb-6">Legal</p>
        <h1 className="text-[2.6rem] md:text-[3.5rem] font-light text-[#1C1C1C] leading-tight mb-3"
          style={{ fontFamily: "var(--font-serif)" }}>
          Privacy Policy
        </h1>
        <p className="text-[11px] text-neutral-300 tracking-[0.05em] mb-14 uppercase">
          Last Updated: June 2026
        </p>

        <div className="space-y-10 text-[13.5px] text-neutral-500 leading-[1.9] tracking-[0.01em]">

          {/* Intro */}
          <section>
            <p>
              This Privacy Policy describes how Yee Eyelashes ("we," "our," or "us"), located at
              278 Plandome Rd, 2nd Floor, Manhasset, NY 11030, collects, uses, and protects your
              personal information when you visit our website, book an appointment, or otherwise
              interact with our services. We are committed to safeguarding your privacy and handling
              your information with care and transparency. By using our website, you agree to the
              practices described in this policy.
            </p>
          </section>

          {/* 1 */}
          <section>
            <h2 className={sectionHead}>1. Information We Collect</h2>

            <h3 className={subHead}>1.1 Information You Provide Directly</h3>
            <p>When you submit a booking request, contact form, or inquiry through our website, we may collect:</p>
            <ul className={bar}>
              <li>Full name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>Preferred appointment date and time</li>
              <li>Requested service(s)</li>
              <li>Any additional notes or messages you voluntarily include</li>
            </ul>
            <p>Providing this information is voluntary; however, certain details are necessary to confirm and manage your appointment.</p>

            <h3 className={subHead}>1.2 Automatically Collected Data — Google Analytics</h3>
            <p>
              We use Google Analytics, a web analytics service provided by Google LLC, to help us understand
              how visitors interact with our website. Google Analytics automatically collects certain technical
              and usage data, which may include identifiers such as:
            </p>
            <ul className={bar}>
              <li>IP address (which may be truncated or anonymized depending on your region)</li>
              <li>Browser type and version</li>
              <li>Device type (desktop, mobile, or tablet)</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on each page</li>
              <li>Referring website or source</li>
              <li>Approximate geographic region (city/country level)</li>
            </ul>
            <p>
              This data is processed by Google and provided to us in aggregated, statistical form to help us
              analyze site performance and improve the user experience. While this data may involve unique
              identifiers such as IP addresses or device IDs, it is not used by us to directly identify
              individual visitors by name. Google's data collection and processing is governed by Google's
              own Privacy Policy, available at{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className={gold}>
                policies.google.com/privacy
              </a>.
            </p>

            <h3 className={subHead}>1.3 Google Search Console</h3>
            <p>
              We use Google Search Console to monitor our website's visibility and performance in Google
              Search results and to identify technical issues that may affect our site. Google Search Console
              provides aggregate data about search queries and page performance and does not collect or
              share personally identifiable information about individual website visitors with us.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className={sectionHead}>2. How We Use Your Information</h2>
            <p>We use the information we collect solely for legitimate business purposes, including:</p>
            <ul className={bar}>
              <li>Confirming, scheduling, and managing your appointments</li>
              <li>Communicating with you regarding your booking, inquiry, or service</li>
              <li>Synchronizing appointment details to Google Calendar for internal scheduling purposes</li>
              <li>Sending appointment confirmations and reminders via email or SMS, where applicable</li>
              <li>Analyzing website traffic and improving the performance and experience of our site</li>
              <li>Monitoring our search engine presence and addressing technical website issues</li>
            </ul>
            <p className="mt-4 font-medium text-[#1C1C1C]">
              We do not sell, rent, or otherwise disclose your personal information to third parties for marketing or commercial purposes.
            </p>
            <p className="mt-3 text-neutral-500">
              We only collect and use personal information to the extent necessary to provide our services and improve your experience.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className={sectionHead}>3. Google Calendar</h2>
            <p>
              When you book an appointment — whether through our website, by phone, or via direct message —
              your appointment details (including your name, requested service, date, and time) may be
              recorded in Google Calendar for the sole purpose of internal scheduling and service management.
              This information is not shared with or accessible to any unauthorized third party.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className={sectionHead}>4. Cookies</h2>
            <p>
              Our website may use cookies — small text files placed on your device — to support website
              functionality and collect analytical data. The types of cookies we may use include:
            </p>
            <ul className={bar}>
              <li><span className="text-[#1C1C1C]">Analytics cookies</span> — Used by Google Analytics to collect usage data (e.g., _ga, _gid, _gat)</li>
              <li><span className="text-[#1C1C1C]">Functional cookies</span> — Essential cookies required for core website performance and navigation</li>
            </ul>
            <p className="mt-4">
              You may manage or disable cookies at any time through your browser settings. Please note that
              disabling certain cookies may affect the functionality or performance of some areas of our website.
              For more information on managing cookies, visit{" "}
              <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className={gold}>
                allaboutcookies.org
              </a>.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className={sectionHead}>5. Third-Party Services</h2>
            <p>
              To operate our website and business, we may use the following third-party services and tools.
              Each third party operates under its own privacy policy and data practices, which we encourage
              you to review independently:
            </p>
            <ul className={bar}>
              <li><span className="text-[#1C1C1C]">Google Analytics</span> — Website traffic and behavior analysis (Google LLC)</li>
              <li><span className="text-[#1C1C1C]">Google Search Console</span> — Search performance monitoring (Google LLC)</li>
              <li><span className="text-[#1C1C1C]">Google Calendar</span> — Appointment scheduling (Google LLC)</li>
              <li><span className="text-[#1C1C1C]">Vercel</span> — Website hosting and deployment infrastructure</li>
              <li><span className="text-[#1C1C1C]">Next.js</span> — Website framework (Vercel Inc.)</li>
              <li><span className="text-[#1C1C1C]">Twilio</span> — SMS and messaging delivery platform (Twilio Inc.). Your phone number may be transmitted to Twilio solely to deliver messages you have consented to receive. Twilio's privacy policy is available at <a href="https://www.twilio.com/en-us/legal/privacy" target="_blank" rel="noopener noreferrer" className={gold}>twilio.com/legal/privacy</a>.</li>
              <li><span className="text-[#1C1C1C]">Supabase</span> — Database and backend infrastructure (if applicable)</li>
              <li><span className="text-[#1C1C1C]">Email service providers</span> — Used to deliver booking confirmations and appointment reminders</li>
              <li><span className="text-[#1C1C1C]">Square / Stripe</span> — Payment processing (if applicable)</li>
              <li><span className="text-[#1C1C1C]">Online booking platforms</span> — Third-party scheduling tools (if applicable)</li>
            </ul>
            <p className="mt-4">
              We take reasonable care in selecting third-party services and require that any service
              providers handling personal data on our behalf do so in a manner consistent with applicable
              privacy laws. We do not sell your personal information to any third party.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className={sectionHead}>6. Email Communications</h2>
            <p>
              If you provide your email address when booking or contacting us, we may send you the following:
            </p>
            <ul className={bar}>
              <li>Appointment confirmation emails</li>
              <li>Appointment reminder emails</li>
              <li>Follow-up communications related to your service</li>
            </ul>
            <p className="mt-4">
              We will not send unsolicited promotional or marketing emails without your prior consent.
              You may opt out of non-essential email communications at any time by contacting us at{" "}
              <a href="tel:5169843859" className={gold}>516-984-3859</a> or through our website contact form.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className={sectionHead}>7. SMS Communications</h2>

            <h3 className={subHead}>7.1 How You Opt In</h3>
            <p>
              Customers provide their mobile phone number when booking an appointment through our
              Square Appointments booking page at{" "}
              <a href="https://square.site/yee" target="_blank" rel="noopener noreferrer" className={gold}>square.site/yee</a>,
              or when contacting us directly by phone or email. By providing their phone number,
              customers consent to receive service-related SMS messages from Yee Eyelashes, including
              appointment reminders, lash refill reminders, and requests for Google reviews.
              Consent is not a condition of purchase. Customers may opt out at any time by replying STOP.
            </p>

            <h3 className={subHead}>7.2 Types of Messages</h3>
            <p>The text messages we send may include:</p>
            <ul className={bar}>
              <li>Appointment confirmation and booking reminders</li>
              <li>Lash refill reminders (sent periodically based on your service schedule)</li>
              <li>Invitations to leave a Google review following your appointment</li>
              <li>Service-related follow-up communications</li>
            </ul>
            <p className="mt-3">
              We do not send unsolicited promotional or marketing text messages. Review invitations
              and refill reminders are considered transactional or relationship messages related to
              services you have received.
            </p>

            <h3 className={subHead}>7.3 Message Frequency</h3>
            <p>
              Message frequency will vary based on your appointment schedule and service history.
              You may receive up to a few messages per appointment cycle (e.g., booking confirmation,
              pre-appointment reminder, post-appointment follow-up or review invitation).
            </p>

            <h3 className={subHead}>7.4 Rates & Carrier Disclaimer</h3>
            <p>
              Message and data rates may apply depending on your mobile carrier and plan.
              Yee Eyelashes is not responsible for any charges incurred from your mobile carrier
              in connection with receiving our text messages.
            </p>

            <h3 className={subHead}>7.5 How to Opt Out</h3>
            <p>
              You may opt out of SMS communications at any time by replying <strong>STOP</strong> to
              any message you receive from us. After opting out, you will receive one final confirmation
              message and no further texts will be sent. To re-subscribe, reply <strong>START</strong> or
              contact us directly.
            </p>

            <h3 className={subHead}>7.6 Help</h3>
            <p>
              For assistance, reply <strong>HELP</strong> to any of our messages, or contact us at{" "}
              <a href="tel:5169843859" className={gold}>516-984-3859</a>.
            </p>

            <h3 className={subHead}>7.7 No Sharing of Phone Numbers</h3>
            <p>
              We will not share, sell, rent, or otherwise disclose your mobile phone number to any
              third party for their marketing purposes. Your phone number is shared with our SMS
              delivery provider (Twilio Inc.) solely for the purpose of transmitting messages you
              have consented to receive, and is subject to Twilio's own privacy practices.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className={sectionHead}>8. Photography & Marketing</h2>
            <p>
              We may photograph or record your lash results for portfolio and marketing purposes,
              including use on our website and social media. No personally identifying information
              will be shared without your explicit consent. If you prefer not to be photographed,
              please inform your lash artist before your service begins.
            </p>
          </section>

          {/* 9 (was 7) */}
          <section>
            <h2 className={sectionHead}>9. Data Security</h2>
            <p>
              We take the security of your personal information seriously. We implement reasonable
              administrative, technical, and physical safeguards designed to protect your data against
              unauthorized access, disclosure, alteration, or destruction. These measures include
              using secure hosting infrastructure, limiting access to personal data to authorized
              personnel only, and applying encryption where appropriate.
            </p>
            <p className="mt-4">
              However, please be aware that no method of data transmission over the internet or electronic
              storage is completely secure. While we strive to use commercially acceptable means to protect
              your personal information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className={sectionHead}>10. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes
              described in this Privacy Policy or as required by applicable law. Booking records may be
              retained for up to 3 years for operational, business, and tax purposes. After this period,
              personal data is securely deleted or anonymized.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className={sectionHead}>11. Your Rights</h2>
            <p>Depending on your location and applicable law, you may have the right to:</p>
            <ul className={bar}>
              <li>Request access to the personal information we hold about you</li>
              <li>Request correction of inaccurate or incomplete information</li>
              <li>Request deletion of your personal data, subject to applicable legal obligations</li>
              <li>Opt out of Google Analytics tracking via your browser settings or Google's official opt-out tool at <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className={gold}>tools.google.com/dlpage/gaoptout</a></li>
              <li>Withdraw consent for non-essential email communications at any time</li>
            </ul>
            <p className="mt-4">
              To exercise any of the above rights, please contact us at{" "}
              <a href="tel:5169843859" className={gold}>516-984-3859</a> or visit us at
              278 Plandome Rd, 2nd Floor, Manhasset, NY 11030.
              We will respond to all valid requests within a reasonable timeframe.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className={sectionHead}>12. Minors</h2>
            <p>
              Clients under 18 years of age must have parental or guardian consent before receiving
              services at Yee Eyelashes. If you believe we have inadvertently collected personal
              information from a minor without appropriate consent, please contact us immediately
              and we will take prompt steps to address the situation.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className={sectionHead}>13. Changes to This Policy</h2>
            <p>
              We reserve the right to update or revise this Privacy Policy at any time to reflect changes
              in our practices, technology, or applicable law. Any updates will be posted on this page
              with a revised "Last Updated" date. We encourage you to review this policy periodically.
              Your continued use of our website following any changes constitutes your acceptance of the
              updated policy.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className={sectionHead}>14. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or the way
              we handle your personal information, please do not hesitate to contact us:
            </p>
            <div className="mt-5 pl-5 border-l border-[#C9A84C]/30 space-y-1.5">
              <p className="text-[#1C1C1C] font-medium">Yee Eyelashes</p>
              <p>278 Plandome Rd, 2nd Floor, Manhasset, NY 11030</p>
              <p><a href="tel:5169843859" className={gold}>516-984-3859</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

/* ─── Chinese ──────────────────────────────────────────────── */
function ZhPolicy() {
  return (
    <div className="pt-[76px] md:pt-[130px] bg-white">
      <div className="max-w-[720px] mx-auto px-6 sm:px-10 py-20 md:py-28">

        <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C] mb-6">法律條款</p>
        <h1 className="text-[2.6rem] md:text-[3.5rem] font-light text-[#1C1C1C] leading-tight mb-3"
          style={{ fontFamily: "var(--font-serif)" }}>
          隱私政策
        </h1>
        <p className="text-[11px] text-neutral-300 tracking-[0.05em] mb-14 uppercase">
          最後更新：2026 年 6 月
        </p>

        <div className="space-y-10 text-[13.5px] text-neutral-500 leading-[1.9] tracking-[0.01em]">

          <section>
            <p>
              本隱私政策說明 Yee Eyelashes（「我們」），地址位於 278 Plandome Rd, 2nd Floor,
              Manhasset, NY 11030，在您瀏覽本網站、預約服務或以其他方式與我們互動時，
              如何收集、使用及保護您的個人資訊。我們承諾以審慎與透明的態度處理您的資料。
              使用本網站即表示您同意本政策所述之做法。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>1. 我們收集的資訊</h2>
            <h3 className={subHead}>1.1 您主動提供的資訊</h3>
            <p>當您透過網站提交預約申請或聯絡表單時，我們可能收集以下資訊：</p>
            <ul className={bar}>
              <li>姓名</li>
              <li>電話號碼</li>
              <li>電子郵件地址</li>
              <li>預約日期與時間</li>
              <li>所需服務項目</li>
              <li>您填寫的其他備注或留言</li>
            </ul>
            <p>提供資訊屬自願性質，但部分資料為確認及管理預約所必需。</p>

            <h3 className={subHead}>1.2 自動收集的資料 — Google Analytics</h3>
            <p>我們使用 Google Analytics 了解訪客與網站的互動方式。Google Analytics 自動收集的技術與使用資料可能包括以下識別符：</p>
            <ul className={bar}>
              <li>IP 地址（可能依地區被截斷或匿名化）</li>
              <li>瀏覽器類型與版本</li>
              <li>裝置類型（桌面、手機、平板）</li>
              <li>作業系統</li>
              <li>瀏覽頁面與停留時間</li>
              <li>來源網站</li>
              <li>大致地理區域（城市/國家層級）</li>
            </ul>
            <p>
              此資料由 Google 處理並以匯總統計形式提供給我們，用於分析網站表現及改善使用體驗。
              雖然資料可能涉及 IP 地址或裝置識別符等唯一識別符，但我們不會藉此直接識別個別訪客的身份。
              Google 的資料收集與處理受其自身隱私政策規範。
            </p>

            <h3 className={subHead}>1.3 Google Search Console</h3>
            <p>
              我們使用 Google Search Console 監測網站在 Google 搜尋結果中的可見度與表現，
              並識別可能影響網站的技術問題。Google Search Console 不會向我們提供可識別個別訪客身份的資訊。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>2. 資訊的使用方式</h2>
            <p>我們僅將收集的資訊用於以下合法業務目的：</p>
            <ul className={bar}>
              <li>確認、安排及管理您的預約</li>
              <li>就預約、查詢或服務事宜與您溝通</li>
              <li>將預約資訊同步至 Google Calendar 以供內部排程使用</li>
              <li>發送預約確認及提醒通知（電郵或簡訊）</li>
              <li>分析網站流量並改善網站表現與使用體驗</li>
              <li>監測搜尋引擎表現並處理網站技術問題</li>
            </ul>
            <p className="mt-4 font-medium text-[#1C1C1C]">
              我們不會出售、出租或以任何方式將您的個人資訊披露給第三方用於行銷或商業目的。
            </p>
            <p className="mt-3 text-neutral-500">
              我們僅在提供服務及改善您使用體驗所必要的範圍內收集和使用個人資訊。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>3. Google Calendar</h2>
            <p>
              當您透過網站、電話或私訊預約時，您的預約資訊（姓名、服務項目、日期與時間）可能會記錄於
              Google Calendar 中，僅用於內部排程與服務管理目的，不會分享給任何未授權的第三方。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>4. Cookies</h2>
            <p>我們的網站可能使用 Cookies（儲存於您裝置的小型文字檔）以支援網站功能及收集分析資料：</p>
            <ul className={bar}>
              <li><span className="text-[#1C1C1C]">分析 Cookies</span> — Google Analytics 用於收集使用資料（如 _ga、_gid、_gat）</li>
              <li><span className="text-[#1C1C1C]">功能性 Cookies</span> — 維持網站核心功能與導航所必需的 Cookies</li>
            </ul>
            <p className="mt-4">您可隨時透過瀏覽器設定管理或停用 Cookies，但這可能影響部分網站功能。</p>
          </section>

          <section>
            <h2 className={sectionHead}>5. 第三方服務</h2>
            <p>為運營網站與業務，我們可能使用以下第三方服務，各服務均有其獨立隱私政策：</p>
            <ul className={bar}>
              <li><span className="text-[#1C1C1C]">Google Analytics</span> — 網站流量與行為分析（Google LLC）</li>
              <li><span className="text-[#1C1C1C]">Google Search Console</span> — 搜尋表現監測（Google LLC）</li>
              <li><span className="text-[#1C1C1C]">Google Calendar</span> — 預約排程（Google LLC）</li>
              <li><span className="text-[#1C1C1C]">Vercel</span> — 網站託管與部署基礎設施</li>
              <li><span className="text-[#1C1C1C]">Next.js</span> — 網站框架（Vercel Inc.）</li>
              <li><span className="text-[#1C1C1C]">Twilio</span> — 簡訊發送平台（Twilio Inc.）。您的電話號碼僅會傳送至 Twilio，以發送您已同意接收的訊息，受 Twilio 自身隱私政策規範。</li>
              <li><span className="text-[#1C1C1C]">Supabase</span> — 資料庫與後端基礎設施（如適用）</li>
              <li><span className="text-[#1C1C1C]">電郵服務商</span> — 用於發送預約確認與提醒通知</li>
              <li><span className="text-[#1C1C1C]">Square / Stripe</span> — 付款處理（如適用）</li>
              <li><span className="text-[#1C1C1C]">線上預約平台</span> — 第三方排程工具（如適用）</li>
            </ul>
            <p className="mt-4">我們不會將您的個人資訊出售給任何第三方。</p>
          </section>

          <section>
            <h2 className={sectionHead}>6. 電子郵件通訊</h2>
            <p className="mb-4">若您提供電郵地址，我們可能發送以下郵件：</p>
            <ul className={bar}>
              <li>預約確認電郵</li>
              <li>預約提醒電郵</li>
              <li>與您服務相關的後續跟進訊息</li>
            </ul>
            <p className="mt-4">
              未經您明確同意，我們不會發送非必要的促銷或行銷郵件。
              您可隨時透過 <a href="tel:5169843859" className="text-[#C9A84C]">516-984-3859</a> 聯絡我們取消訂閱。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>7. 簡訊通訊</h2>

            <h3 className={subHead}>7.1 如何同意接收簡訊</h3>
            <p>
              客戶在透過我們的 Square Appointments 預約頁面（
              <a href="https://square.site/yee" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:underline">square.site/yee</a>
              ）預約，或直接以電話或電郵聯絡我們時，會提供手機號碼。
              提供手機號碼即表示客戶同意接收來自 Yee Eyelashes 的服務相關簡訊，
              包括預約提醒、睫毛補充提醒，以及邀請撰寫 Google 評價等。
              同意接收簡訊並非購買任何服務的必要條件。客戶可隨時回覆 STOP 取消訂閱。
            </p>

            <h3 className={subHead}>7.2 訊息類型</h3>
            <p>我們發送的簡訊可能包括：</p>
            <ul className={bar}>
              <li>預約確認及預約提醒</li>
              <li>睫毛補充提醒（根據您的服務週期定期發送）</li>
              <li>服務完成後邀請您撰寫 Google 評價的通知</li>
              <li>與您所接受服務相關的後續跟進訊息</li>
            </ul>
            <p className="mt-3">
              我們不會發送未經請求的促銷或行銷簡訊。評價邀請及補充提醒屬於與您已接受服務相關的交易或關係訊息。
            </p>

            <h3 className={subHead}>7.3 訊息頻率</h3>
            <p>
              訊息頻率將依您的預約排程及服務記錄而有所不同。在一個服務週期內（例如預約確認、
              預約前提醒、服務後跟進或評價邀請），您可能收到數條訊息。
            </p>

            <h3 className={subHead}>7.4 費率與電信免責聲明</h3>
            <p>
              訊息及數據費用依您的電信方案而定。Yee Eyelashes 對於您因接收我們簡訊而
              產生的任何電信費用概不負責。
            </p>

            <h3 className={subHead}>7.5 如何取消訂閱</h3>
            <p>
              您可隨時回覆 <strong>STOP</strong> 取消接收我們的簡訊。
              退訂後，您將收到一則最終確認訊息，之後不會再收到任何簡訊。
              如需重新訂閱，請回覆 <strong>START</strong> 或直接聯絡我們。
            </p>

            <h3 className={subHead}>7.6 協助</h3>
            <p>
              如需協助，請回覆 <strong>HELP</strong>，或透過{" "}
              <a href="tel:5169843859" className="text-[#C9A84C]">516-984-3859</a> 聯絡我們。
            </p>

            <h3 className={subHead}>7.7 不分享手機號碼</h3>
            <p>
              我們不會將您的手機號碼出售、出租或以任何方式披露給任何第三方用於其行銷目的。
              您的電話號碼僅會傳送至我們的簡訊發送服務商（Twilio Inc.），
              用於傳遞您已同意接收的訊息，並受 Twilio 自身隱私政策規範。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>8. 攝影與行銷</h2>
            <p>
              我們可能拍攝您的睫毛效果照片或影片，用於作品集及行銷宣傳，包括本網站及社群媒體。
              未經您明確同意，不會公開任何可識別個人身份的資訊。如不希望被拍攝，請在服務開始前告知技師。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>9. 資料安全</h2>
            <p>
              我們重視您個人資訊的安全，並採取合理的行政、技術及實體保護措施，
              以防止您的資料遭到未授權存取、披露、篡改或毀損。
              這些措施包括使用安全的託管基礎設施、限制個人資料的存取權限，以及在適當情況下採用加密技術。
            </p>
            <p className="mt-4">
              但請注意，網際網路上的資料傳輸或電子儲存方式均無法保證絕對安全。
              我們將盡力採取商業上合理的方式保護您的個人資訊，但無法保證完全的資料安全。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>10. 資料保存期限</h2>
            <p>
              我們僅在履行本政策所述目的或法律規定所需期間內保留您的個人資訊。
              預約記錄可能保留最多 3 年，用於業務運營、商業及稅務目的。
              超過保存期限後，個人資料將被安全刪除或匿名化處理。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>11. 您的權利</h2>
            <p>根據您所在地區及適用法律，您可能享有以下權利：</p>
            <ul className={bar}>
              <li>要求查閱我們持有的您的個人資料</li>
              <li>要求更正不準確或不完整的資訊</li>
              <li>在適用法律義務範圍內要求刪除您的個人資料</li>
              <li>透過瀏覽器設定或 Google 官方退出工具停用 Google Analytics 追蹤</li>
              <li>隨時撤回對非必要電郵通訊的同意</li>
            </ul>
            <p className="mt-4">
              如需行使上述任何權利，請透過 <a href="tel:5169843859" className="text-[#C9A84C]">516-984-3859</a> 聯絡我們，
              或親臨 278 Plandome Rd, 2nd Floor, Manhasset, NY 11030。我們將在合理時間內回應所有有效請求。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>12. 未成年人政策</h2>
            <p>
              18 歲以下客人須在接受服務前取得父母或法定監護人同意。
              若您認為我們在未獲適當授權的情況下收集了未成年人的個人資訊，請立即聯絡我們，我們將立即處理。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>13. 政策更新</h2>
            <p>
              我們保留隨時更新或修訂本隱私政策的權利，以反映我們業務做法、技術或適用法律的變化。
              任何更新將在本頁發布並更新「最後更新」日期。建議您定期查閱本政策。
              在更改後繼續使用本網站即表示您接受更新後的政策。
            </p>
          </section>

          <section>
            <h2 className={sectionHead}>14. 聯絡我們</h2>
            <p>如對本隱私政策或我們處理您個人資訊的方式有任何疑問或請求，請隨時聯絡我們：</p>
            <div className="mt-5 pl-5 border-l border-[#C9A84C]/30 space-y-1.5">
              <p className="text-[#1C1C1C] font-medium">Yee Eyelashes</p>
              <p>278 Plandome Rd, 2nd Floor, Manhasset, NY 11030</p>
              <p><a href="tel:5169843859" className="text-[#C9A84C] hover:underline">516-984-3859</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
