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
    id: "new-clients",
    title: "New Clients",
    titleZh: "新客戶專屬",
    description: "New clients 30% off your first service.",
    descriptionZh: "新客戶首次服務享有 30% 折扣。",
    note: "Valid for first-time clients only.",
    noteZh: "僅限首次光臨的新客戶。",
    active: true,
  },
];
