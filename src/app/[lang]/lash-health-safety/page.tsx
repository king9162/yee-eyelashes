import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLang } from "@/i18n";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (lang === "zh") {
    return {
      title: "睫毛護理與自然睫毛健康 | YEE EYELASHES 曼哈薩特",
      description: "如何在嫁接睫毛延伸的同時保持自然睫毛健康。Yee Eyelashes 曼哈薩特工作室的護理建議、預約注意事項，以及如何讓每次睫毛預約效果最大化。",
      alternates: {
        canonical: "https://www.yeeeyelashes.com/zh/lash-health-safety",
        languages: {
          "en": "https://www.yeeeyelashes.com/en/lash-health-safety",
          "zh-TW": "https://www.yeeeyelashes.com/zh/lash-health-safety",
          "x-default": "https://www.yeeeyelashes.com/en/lash-health-safety",
        },
      },
      openGraph: {
        title: "睫毛護理與自然睫毛健康 | Yee Eyelashes 曼哈薩特",
        description: "Yee Eyelashes 曼哈薩特工作室的睫毛護理指南。了解如何在享受美麗睫毛延伸的同時保持自然睫毛健康。",
        url: "https://www.yeeeyelashes.com/zh/lash-health-safety",
        type: "website",
        locale: "zh_TW",
        siteName: "Yee Eyelashes",
      },
    };
  }
  return {
    title: "Lash Health & Natural Lash Care | Yee Eyelashes Manhasset NY",
    description: "How to keep your natural lashes healthy with eyelash extensions. Aftercare tips, what to expect at Yee Eyelashes in Manhasset, and how to get the most out of every lash appointment.",
    alternates: {
      canonical: "https://www.yeeeyelashes.com/en/lash-health-safety",
      languages: {
        "en": "https://www.yeeeyelashes.com/en/lash-health-safety",
        "zh-TW": "https://www.yeeeyelashes.com/zh/lash-health-safety",
        "x-default": "https://www.yeeeyelashes.com/en/lash-health-safety",
      },
    },
    openGraph: {
      title: "Lash Health & Natural Lash Care | Yee Eyelashes Manhasset NY",
      description: "Aftercare tips and lash health guidance from Yee Eyelashes in Manhasset, NY. Keep your natural lashes healthy while enjoying beautiful extensions.",
      url: "https://www.yeeeyelashes.com/en/lash-health-safety",
      type: "website",
      locale: "en_US",
      siteName: "Yee Eyelashes",
    },
  };
}

const breadcrumbEn = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.yeeeyelashes.com/en" },
    { "@type": "ListItem", position: 2, name: "Lash Health", item: "https://www.yeeeyelashes.com/en/lash-health-safety" },
  ],
};

const breadcrumbZh = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "首頁", item: "https://www.yeeeyelashes.com/zh" },
    { "@type": "ListItem", position: 2, name: "睫毛護理", item: "https://www.yeeeyelashes.com/zh/lash-health-safety" },
  ],
};

const faqSchemaEn = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I take care of my lash extensions after the appointment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Avoid water and steam for the first 24 hours after your appointment. After that, gently wash your lashes daily with a lash-safe, oil-free cleanser and brush them with a clean spoolie each morning. Avoid oil-based products around the eye area, and do not pull or pick at your extensions. Sleeping on your back or side helps protect the shape. We go over all of this with you at your appointment.",
      },
    },
    {
      "@type": "Question",
      name: "Will lash extensions damage my natural lashes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lash extensions applied by an experienced technician should not damage your natural lashes. The key factors are selecting the right weight and length for your natural lash strength, and following proper aftercare. At Yee Eyelashes, we take your natural lash health seriously and recommend styles that are appropriate for your lashes, not just the most dramatic option.",
      },
    },
    {
      "@type": "Question",
      name: "How do I make my lash extensions last longer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The single biggest factor is aftercare. Clean lashes last significantly longer than uncleaned ones. Wash them every day or two with an oil-free cleanser, avoid steam and excessive humidity right after fills, and book your refill on schedule — we recommend every two weeks for best results. Avoiding oil-based skincare around the eyes also helps retention considerably.",
      },
    },
    {
      "@type": "Question",
      name: "Is Yee Eyelashes suitable for first-time lash extension clients?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every first appointment at Yee Eyelashes includes a consultation where we discuss your goals, your natural lash condition, and realistic expectations for maintenance. We recommend styles that are appropriate for first-time clients and explain aftercare thoroughly before you leave.",
      },
    },
    {
      "@type": "Question",
      name: "How do I know which lash style is right for my natural lashes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "That is exactly what our consultation is for. Before every appointment we evaluate your eye shape and natural lash condition, then recommend lengths and styles that will look great and hold up well. The right set for you depends on your natural lash strength, your lifestyle, and how much maintenance you want to commit to.",
      },
    },
  ],
};

const faqSchemaZh = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "嫁接完成後如何護理睫毛延伸？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "預約後前24小時避免接觸水分和蒸氣。之後每天用無油睫毛清潔液和軟刷輕柔清潔，每天早上用乾淨的睫毛刷梳理。避免在眼部周圍使用含油產品，不要拉扯或挑剔延伸品。仰臥或側臥有助於保持形狀。我們在每次預約時都會詳細說明這些注意事項。",
      },
    },
    {
      "@type": "Question",
      name: "睫毛延伸會損傷我的自然睫毛嗎？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "由有經驗的技師嫁接的睫毛延伸不應該損傷您的自然睫毛。關鍵因素是根據您自然睫毛的強度選擇適當的重量和長度，以及遵循正確的護理方式。在 Yee Eyelashes，我們認真看待您的自然睫毛健康，只推薦適合您睫毛狀況的款式，而非僅僅追求最誇張的效果。",
      },
    },
    {
      "@type": "Question",
      name: "如何讓睫毛延伸維持更久？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "最重要的因素是護理。清潔的睫毛比未清潔的睫毛持久性顯著更好。每天或隔天用無油清潔液清洗，補睫後避免蒸氣和過度潮濕環境，並按時預約補睫。我們建議每兩週補睫一次效果最佳。避免在眼部周圍使用含油護膚品也能大幅提升持久度。",
      },
    },
    {
      "@type": "Question",
      name: "Yee Eyelashes 適合第一次嫁接睫毛的客戶嗎？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "適合。在 Yee Eyelashes 的每次初次預約都包含諮詢，我們會討論您的期望、自然睫毛狀況以及維護的實際預期。我們為初次客戶推薦適合的款式，並在離開前詳細說明護理方式。",
      },
    },
    {
      "@type": "Question",
      name: "如何知道哪種睫毛款式適合我的自然睫毛？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "這正是我們諮詢的目的。每次預約前，我們會評估您的眼型和自然睫毛狀況，然後推薦既美觀又持久的長度和款式。適合您的方案取決於您自然睫毛的強度、生活習慣以及您願意投入的維護時間。",
      },
    },
  ],
};

const aftercareTipsEn = [
  {
    title: "First 24 Hours",
    body: "Keep lashes dry and avoid steam, saunas, and heavy exercise. The adhesive needs time to fully cure, and moisture in the first day can affect how long your set lasts.",
  },
  {
    title: "Daily Cleaning",
    body: "Clean your lashes every day or every other day with an oil-free lash cleanser and a soft brush. Dirty lashes break down the bond faster and can irritate the eye. This is the most important aftercare habit.",
  },
  {
    title: "Brush Every Morning",
    body: "Use a clean spoolie to brush your lashes each morning. This keeps them aligned and prevents any tangling or crossing that can happen overnight.",
  },
  {
    title: "Avoid Oil-Based Products",
    body: "Oil breaks down lash adhesive. Avoid oil-based makeup removers, eye creams, and serums around the lash line. Check your skincare labels if you notice faster-than-usual shedding.",
  },
  {
    title: "Sleep Position",
    body: "Sleeping on your back or side preserves the shape of your lashes better than face-down sleeping. A silk pillowcase also reduces friction.",
  },
  {
    title: "Book Refills on Schedule",
    body: "Refills every two weeks keep your set looking full. Waiting longer is fine, but you will lose more lashes and may need a fuller refill or a new set. We offer 1, 2, and 3 week refill options.",
  },
];

const aftercareTipsZh = [
  {
    title: "前24小時",
    body: "保持睫毛乾燥，避免蒸氣、桑拿及大量運動。黏著劑需要時間完全固化，第一天內接觸水分可能影響您的睫毛持久度。",
  },
  {
    title: "每日清潔",
    body: "每天或每隔一天使用無油睫毛清潔液和軟刷清潔睫毛。髒污的睫毛會加速黏著劑分解，並可能刺激眼部。這是最重要的護理習慣。",
  },
  {
    title: "每天早上梳理",
    body: "每天早上使用乾淨的睫毛刷梳理睫毛，保持睫毛整齊排列，避免睡眠後出現交叉或纏繞的情況。",
  },
  {
    title: "避免含油產品",
    body: "油脂會分解睫毛黏著劑。請避免在睫毛根部周圍使用含油卸妝液、眼霜和精華液。如果您發現睫毛比平時更快脫落，請檢查您的護膚品成分。",
  },
  {
    title: "睡眠姿勢",
    body: "仰臥或側臥比趴睡更能保持睫毛形狀。使用絲綢枕套也能減少摩擦。",
  },
  {
    title: "按時預約補睫",
    body: "每兩週補睫一次可保持睫毛豐盈飽滿。等待更長時間也可以，但會損失更多睫毛，可能需要更全面的補睫或重新嫁接。我們提供1週、2週和3週補睫選項。",
  },
];

const consultationItemsEn = [
  { label: "Eye Shape Assessment", desc: "We look at your eye shape and bone structure before recommending any curl, length, or mapping style. The right lash map makes a significant difference in how natural and flattering the result looks." },
  { label: "Natural Lash Condition", desc: "We check the strength and density of your natural lashes before selecting extension weight. Extensions that are too heavy for the natural lash will cause premature shedding and stress to the follicle." },
  { label: "Lifestyle Consideration", desc: "How active you are, how often you wash your face, your skincare routine, and how much maintenance time you have all factor into what we recommend. A style that works on paper may not work for your life." },
  { label: "Honest Guidance", desc: "If a style you want is not a good fit for your lashes at this time, we will tell you directly. We would rather give you a set you will love in three weeks than one that looks dramatic on day one and causes problems by day seven." },
];

const consultationItemsZh = [
  { label: "眼型評估", desc: "在推薦任何捲翹度、長度或睫毛排列方式之前，我們會先觀察您的眼型和骨骼結構。正確的睫毛設計對最終效果的自然感和美觀度有很大影響。" },
  { label: "自然睫毛狀況", desc: "在選擇延伸品重量之前，我們會確認您自然睫毛的強度和密度。過重的延伸品會導致過早脫落並對毛囊造成壓力。" },
  { label: "生活方式考量", desc: "您的運動習慣、洗臉頻率、護膚程序以及您有多少時間進行維護，都是我們推薦的參考因素。在紙上看起來不錯的款式，未必適合您的日常生活。" },
  { label: "誠實建議", desc: "如果您想要的款式目前不適合您的睫毛狀況，我們會直接告知。比起讓您第一天看起來很戲劇化但第七天就出現問題，我們更希望給您一個三週後仍然滿意的效果。" },
];

export default async function LashHealthSafetyPage({ params }: Props) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const isZh = lang === "zh";
  const bookHref = "/";
  const breadcrumb = isZh ? breadcrumbZh : breadcrumbEn;
  const faqSchema = isZh ? faqSchemaZh : faqSchemaEn;
  const aftercareTips = isZh ? aftercareTipsZh : aftercareTipsEn;
  const consultationItems = isZh ? consultationItemsZh : consultationItemsEn;

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PageHeader
        eyebrow={isZh ? "睫毛護理" : "Lash Care"}
        title={isZh ? "自然睫毛健康與護理指南" : "Natural Lash Health & Aftercare"}
        subtitle={
          isZh
            ? "如何保護您的自然睫毛、讓延伸效果更持久，並在每次到我們曼哈薩特工作室預約時獲得最佳效果。"
            : "How to protect your natural lashes, make your extensions last longer, and get the most out of every appointment at our Manhasset studio."
        }
      />

      <section className="bg-white py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">

          {/* Intro */}
          <div className="max-w-3xl mb-20">
            <div className="flex items-center gap-4 mb-7">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">
                {isZh ? "我們的理念" : "Our Approach"}
              </span>
            </div>
            <h2
              className="text-[2rem] md:text-[2.4rem] font-light text-[#1C1C1C] leading-tight mb-6"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {isZh ? "美麗的睫毛始於健康的自然睫毛" : "Beautiful Lashes Start with Healthy Natural Lashes"}
            </h2>
            <div className="space-y-5 text-[13.5px] text-neutral-500 leading-[1.95]">
              {isZh ? (
                <>
                  <p>
                    在 Yee Eyelashes，我們認真看待您的自然睫毛健康。在推薦任何款式之前，我們會先了解您的眼型、自然睫毛的長度與狀況，以及您的日常生活習慣。我們的目標是找到真正適合您睫毛的款式，而不只是菜單上最誇張的選項。
                  </p>
                  <p>
                    優質材料確實有差別。我們的 Real Mink 和 Premium Cashmere 纖維比一般合成材料更輕、更細，每根自然睫毛所承受的重量因此更少。不過度負擔的睫毛能更自然地生長代謝，長期下來保持更健康的狀態。
                  </p>
                  <p>
                    護理同樣重要。以下是我們在每次預約結束時告訴每位客戶的內容，因為您在家中的護理方式，對睫毛的持久度和自然睫毛健康的影響，不亞於我們在工作室所做的一切。
                  </p>
                </>
              ) : (
                <>
                  <p>
                    At Yee Eyelashes in Manhasset, we take your natural lash health seriously. Before recommending any style, we look at your eye shape, your natural lash length and condition, and your daily routine. The goal is a set that looks great and is appropriate for your lashes, not just the most dramatic option on the menu.
                  </p>
                  <p>
                    Premium materials make a real difference. Our Real Mink and Premium Cashmere fibers are lighter and finer than standard synthetics, which means less weight on each natural lash. Lashes that are not overburdened shed more naturally and stay healthier over time.
                  </p>
                  <p>
                    Aftercare is equally important. Below is exactly what we tell every client at the end of their appointment — because how you care for your lashes at home has as much impact on retention and natural lash health as anything we do in the studio.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Aftercare Grid */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">
                {isZh ? "護理指南" : "Aftercare Guide"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aftercareTips.map((tip) => (
                <div key={tip.title} className="border border-neutral-100 p-8">
                  <h3
                    className="text-[1rem] font-light text-[#1C1C1C] mb-4"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {tip.title}
                  </h3>
                  <p className="text-[13px] text-neutral-400 leading-[1.85]">{tip.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Consultation First */}
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">
                {isZh ? "諮詢優先" : "Consultation First"}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <h2
                  className="text-[1.6rem] md:text-[2rem] font-light text-[#1C1C1C] leading-tight mb-6"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {isZh ? "我們推薦真正適合您睫毛的款式" : "We Recommend What Works for Your Lashes"}
                </h2>
                <div className="space-y-4 text-[13.5px] text-neutral-500 leading-[1.95]">
                  {isZh ? (
                    <>
                      <p>
                        每次在 Yee Eyelashes 的預約都從諮詢開始。我們會評估您的自然睫毛狀況，並討論您想要的款式。如果您想要的款式適合您的睫毛，我們就做。如果可能造成問題，我們會直接告知並提供替代方案。
                      </p>
                      <p>
                        不是每位客戶都適合相同的款式。自然睫毛細而稀疏的客戶需要與睫毛濃密粗壯的客戶不同的方案。我們會根據每個人的情況調整建議，而不是對所有人使用相同的設計。
                      </p>
                      <p>
                        這也是我們與因其他工作室造成損傷而前來修復的客戶合作的方式。我們評估現有狀況，推薦有利於恢復的款式，並以適當的間隔安排補睫，讓睫毛能夠正常再生。
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Every appointment at Yee Eyelashes starts with a consultation. We look at your natural lash condition and discuss the style you have in mind. If what you want is appropriate for your lashes, we will do it. If it is likely to cause problems, we will tell you and offer an alternative.
                      </p>
                      <p>
                        Not every client is a candidate for the same style. Someone with fine, sparse natural lashes needs a different approach than someone with thick, dense natural lashes. We adjust our recommendations accordingly rather than applying the same set to everyone.
                      </p>
                      <p>
                        This is also how we work with clients who are coming back from damage done at another studio. We assess what is there, recommend a recovery-friendly set, and space fills in a way that lets the lashes grow back in properly.
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                {consultationItems.map((item) => (
                  <div key={item.label} className="flex gap-6">
                    <div className="w-px bg-[#C9A84C]/30 flex-shrink-0" />
                    <div>
                      <p className="text-[0.9rem] font-light text-[#1C1C1C] mb-1" style={{ fontFamily: "var(--font-serif)" }}>{item.label}</p>
                      <p className="text-[12.5px] text-neutral-400 leading-[1.85]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-8 h-px bg-[#C9A84C]" />
              <span className="text-[9.5px] uppercase tracking-[0.5em] text-[#C9A84C]">
                {isZh ? "常見問題" : "Common Questions"}
              </span>
            </div>
            <div className="space-y-8 max-w-3xl">
              {faqSchema.mainEntity.map((item) => (
                <div key={item.name}>
                  <h3
                    className="text-[1rem] font-light text-[#1C1C1C] mb-3"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {item.name}
                  </h3>
                  <p className="text-[13px] text-neutral-400 leading-[1.85]">
                    {item.acceptedAnswer.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-14 border-t border-neutral-100 flex flex-col sm:flex-row items-center gap-5">
            <div className="flex-1 h-px bg-neutral-100 hidden sm:block" />
            <Link
              href={bookHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.35em] bg-[#1C1C1C] text-white px-10 py-4 hover:bg-[#C9A84C] transition-colors duration-300 whitespace-nowrap"
            >
              {isZh ? "立即預約" : "Book Your Appointment"}
            </Link>
            <Link
              href={`/${lang}/faq`}
              className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 hover:text-[#C9A84C] transition-colors duration-300 whitespace-nowrap"
            >
              {isZh ? "更多常見問題" : "More Questions"}
            </Link>
            <div className="flex-1 h-px bg-neutral-100 hidden sm:block" />
          </div>

        </div>
      </section>
    </div>
  );
}
