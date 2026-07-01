export type Promotion = {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  note?: string;
  noteZh?: string;
  active: boolean;
};

export const promotions: Promotion[] = [
  {
    id: "mothers-day",
    title: "Mother's Day Special — 50% Off",
    titleZh: "母親節特別優惠 — 半價",
    description: "New clients get 50% off all eyelash extensions. Valid April 20 – May 10. Complimentary gift bag with every visit.",
    descriptionZh: "新客戶全線眼睫毛服務享 50% 折扣，即日起至 5/10。每位到訪客人獲贈精美禮品袋。",
    note: "Valid for first-time clients only. No code required — discount applied on-site.",
    noteZh: "僅限新客戶首次光臨。無需折扣碼，到店直接套用。",
    active: false,
  },
  {
    id: "new-clients",
    title: "New Clients — 30% Off First Visit",
    titleZh: "新客戶首次到訪 享 30% 折扣",
    description: "New clients receive 30% off their first eyelash extension service. All styles included — Real Mink, Premium Cashmere, and 3D Lashes.",
    descriptionZh: "新客戶首次睫毛服務享 30% 折扣，適用全線服務，包括 Real Mink、Premium Cashmere 及 3D 豐盈款式。",
    note: "Discount applied on-site. No code required.",
    noteZh: "到店直接套用，無需折扣碼。",
    active: true,
  },
  {
    id: "three-times-package",
    title: "Buy More, Save More — Three Times Package",
    titleZh: "買越多，省越多 — 三次套裝",
    description: "Book three lash sessions upfront and save compared to single visit pricing. Available for Real Mink and Premium Cashmere. Real Mink from $150 · Premium Cashmere from $200.",
    descriptionZh: "預購三次套裝，比單次到訪更划算。適用於 Real Mink 及 Premium Cashmere 系列。Real Mink 低至 $150 · Premium Cashmere 低至 $200。",
    note: "Sessions can be used for new sets or refills. Ask us in-studio for details.",
    noteZh: "套裝次數可用於全新嫁接或補睫，到店諮詢詳情。",
    active: true,
  },
  {
    id: "birthday-month",
    title: "Birthday Month — 20% Off",
    titleZh: "生日月份 享 20% 折扣",
    description: "Celebrate your birthday with beautiful lashes! Enjoy 20% off any service during your birthday month — because you deserve to look stunning on your special day.",
    descriptionZh: "用美麗的睫毛慶祝你的生日！生日當月所有服務享 20% 折扣，讓你在特別的日子光彩照人。",
    note: "Valid during your birthday month. Mention your birthday when booking. No code required.",
    noteZh: "生日當月有效。預約時請說明生日月份，無需折扣碼。",
    active: true,
  },
];
