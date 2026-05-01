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
    active: true,
  },
  {
    id: "new-clients",
    title: "New Clients",
    titleZh: "新客戶專屬",
    description: "New clients 30% off your first service.",
    descriptionZh: "新客戶首次服務享有 30% 折扣。",
    note: "Valid for first-time clients only.",
    noteZh: "僅限首次光臨的新客戶。",
    active: false,
  },
];
