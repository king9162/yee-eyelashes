export type PmuItem = {
  name: string;
  nameZh: string;
  price?: number;
  note?: string;
  noteZh?: string;
  popular?: boolean;
};

export type PmuCategory = {
  category: string;
  categoryZh: string;
  services: PmuItem[];
};

export const pmuServices: PmuCategory[] = [
  {
    category: "Brows",
    categoryZh: "眉毛紋繡",
    services: [
      {
        name: "Microblading",
        nameZh: "飄眉",
        price: 599,
      },
      {
        name: "Combination Brows",
        nameZh: "組合眉",
        price: 650,
        popular: true,
      },
      {
        name: "Ombre Powder Brows",
        nameZh: "霧眉",
        price: 599,
      },
      {
        name: "Nano Hairstroke Brows",
        nameZh: "納米髮絲眉",
        price: 599,
      },
      {
        name: "6–8 Week Touch Up",
        nameZh: "6–8 週補色",
        price: 150,
        note: "For existing Yee clients only",
        noteZh: "僅限 Yee 現有客戶",
      },
    ],
  },
  {
    category: "Lip",
    categoryZh: "唇部紋繡",
    services: [
      {
        name: "Lip Blush",
        nameZh: "唇部暈染",
        price: 599,
        note: "Includes a 6–8 week touch up session",
        noteZh: "含 6–8 週補色一次",
        popular: true,
      },
    ],
  },
  {
    category: "Eyes",
    categoryZh: "眼線紋繡",
    services: [
      {
        name: "Classic Eyeliner (Top Liner)",
        nameZh: "經典眼線（上眼線）",
        price: 380,
      },
      {
        name: "Lash Line Enhancement (Top Liner)",
        nameZh: "睫毛根部填充（上眼線）",
        price: 350,
      },
      {
        name: "Add-On Bottom Liner",
        nameZh: "加購下眼線",
        price: 100,
        note: "Add-on only",
        noteZh: "加購項目",
      },
    ],
  },
  {
    category: "Brow Care",
    categoryZh: "眉毛護理",
    services: [
      {
        name: "Brow Lamination + Tinting + Shaping",
        nameZh: "眉毛定型 + 染色 + 修型",
        price: 75,
        popular: true,
      },
      {
        name: "Brow Lamination + Shaping",
        nameZh: "眉毛定型 + 修型",
        price: 60,
      },
    ],
  },
];
