export type ServiceItem = {
  name: string;
  nameZh: string;
  descriptionEn?: string;
  descriptionZh?: string;
  price: number | null;
  duration?: string;
  note?: string;
  noteZh?: string;
  popular?: boolean;
};

export type ServiceCategory = {
  id: string;
  category: string;
  categoryZh: string;
  items: ServiceItem[];
};

export const services: ServiceCategory[] = [
  {
    id: "full-set",
    category: "Full Set",
    categoryZh: "全套嫁接",
    items: [
      {
        name: "Classic Natural",
        nameZh: "經典自然款",
        descriptionEn: "80 precisely placed extensions — the gold standard for a polished, mascara-free morning. Clean, refined, and effortlessly elegant. Perfect for first-timers and everyday wear.",
        descriptionZh: "80 根精準嫁接——打造無需睫毛膏的精緻早晨。乾淨、細膩、毫不費力的優雅。初次體驗與日常配戴的最佳選擇。",
        price: 80,
        duration: "75 min",
        note: "80 lashes",
        noteZh: "80 根",
      },
      {
        name: "Classic Signature",
        nameZh: "經典精選款",
        descriptionEn: "100 lashes meticulously chosen for your eye shape. Subtle enough for the boardroom, refined enough for dinner. Our most popular enhancement — wake up effortlessly ready.",
        descriptionZh: "100 根根據您眼型精心挑選。低調到可以進會議室，精緻到足以出席晚宴。我們最受歡迎的選擇——每天醒來即刻呈現最佳狀態。",
        price: 100,
        duration: "90 min",
        note: "100 lashes",
        noteZh: "100 根",
        popular: true,
      },
      {
        name: "Classic Full",
        nameZh: "經典全套款",
        descriptionEn: "120 extensions for a complete, lush look without the drama. Maximum definition, natural finish — the closest thing to the most perfect lashes you were born with.",
        descriptionZh: "120 根打造豐盈完整效果，卻不失自然感。極致清晰度，自然妝感收尾——無限接近天生完美睫毛的存在。",
        price: 120,
        duration: "105 min",
        note: "120 lashes",
        noteZh: "120 根",
      },
      {
        name: "Hybrid Set",
        nameZh: "混合全套",
        descriptionEn: "The intelligent balance between natural and dramatic. Classic lashes layered with handcrafted volume fans create undeniable texture and depth — the look that gets noticed for all the right reasons.",
        descriptionZh: "自然與戲劇感之間的完美平衡。經典睫毛結合手工豐盈扇形，創造無可忽視的層次感與深度——那種讓人忍不住多看幾眼的妝感。",
        price: 120,
        duration: "2 hrs",
        popular: true,
      },
      {
        name: "Volume Set",
        nameZh: "豐盈全套",
        descriptionEn: "Handcrafted Russian volume fans applied to each natural lash for a full, multi-dimensional look that photographs beautifully and commands every room you enter.",
        descriptionZh: "手工製作的俄式豐盈扇形嫁接於每根天然睫毛，打造豐盈、多層次的效果——上鏡完美，走進每個場合都奪目。",
        price: 140,
        duration: "2.5 hrs",
        popular: true,
      },
    ],
  },
  {
    id: "refill",
    category: "Refill",
    categoryZh: "補睫",
    items: [
      {
        name: "1 Week Refill",
        nameZh: "一週補睫",
        descriptionEn: "Keep your lashes looking freshly applied — recommended for clients who want maximum fullness at all times.",
        descriptionZh: "保持睫毛剛嫁接的豐盈感——適合追求全程最佳狀態的客戶。",
        price: 40,
        note: "4–7 days since last appointment",
        noteZh: "上次預約後 4–7 天",
      },
      {
        name: "2 Week Refill",
        nameZh: "兩週補睫",
        descriptionEn: "Our most popular maintenance schedule. Fill in natural lash shed and restore your set to full, beautiful volume.",
        descriptionZh: "我們最受歡迎的維護頻率。補回自然脫落的部分，恢復完整豐盈的效果。",
        price: 50,
        note: "8–14 days since last appointment",
        noteZh: "上次預約後 8–14 天",
      },
      {
        name: "3 Week Refill",
        nameZh: "三週補睫",
        descriptionEn: "Comprehensive refresh for clients on a longer maintenance cycle. Restores fullness and corrects any grown-out angles.",
        descriptionZh: "為維護週期較長的客戶提供全面補睫服務。恢復豐盈度並修正因生長產生的角度偏移。",
        price: 70,
        note: "15–21 days since last appointment",
        noteZh: "上次預約後 15–21 天",
      },
    ],
  },
  {
    id: "lash-services",
    category: "Lash Services",
    categoryZh: "睫毛護理",
    items: [
      {
        name: "Lash Lift",
        nameZh: "睫毛燙翹",
        descriptionEn: "Your natural lashes, reimagined. A precision curl that opens the eye, lifts the gaze, and requires zero maintenance for 6–8 weeks. The most effortless upgrade you'll ever make.",
        descriptionZh: "讓天然睫毛煥然一新。精準卷翹讓眼睛更大、眼神更有神，6-8 週零維護。您所能做的最輕鬆的美麗升級。",
        price: 60,
      },
      {
        name: "Tint",
        nameZh: "睫毛染色",
        descriptionEn: "Intensify your natural lashes with professional pigment — darker, bolder, more defined. No mascara. No smudging. Pure effortless definition from morning to night.",
        descriptionZh: "以專業染料深化天然睫毛——更深、更濃、更有輪廓。無需睫毛膏。不會暈染。從早到晚純粹的輕鬆美麗。",
        price: 30,
      },
      {
        name: "Lash Lift + Tint",
        nameZh: "睫毛燙翹加染色",
        descriptionEn: "Our most-booked combo. Lifted, curled, darkened, and defined — your eyes transformed in under 60 minutes. The ultimate low-maintenance luxury for the modern woman.",
        descriptionZh: "我們最受預約的組合。翹起、捲曲、加深、清晰——60 分鐘內讓雙眼煥然一新。現代女性的極致低維護奢享。",
        price: 80,
        popular: true,
      },
      {
        name: "Eyelash Removal",
        nameZh: "睫毛卸除",
        descriptionEn: "Professional removal using specialized solutions that dissolve adhesive without stressing natural lashes. We always leave your lashes healthier than we found them.",
        descriptionZh: "使用專業溶劑輕柔卸除，在不損傷天然睫毛的前提下溶解黏合劑。我們始終讓您的天然睫毛在服務後比之前更健康。",
        price: 20,
      },
    ],
  },
  {
    id: "add-on",
    category: "Add-On",
    categoryZh: "加購服務",
    items: [
      {
        name: "Bottom Lashes",
        nameZh: "下睫毛",
        price: 30,
      },
      {
        name: "Colored Lashes",
        nameZh: "彩色睫毛",
        price: 15,
      },
      {
        name: "Brow Tint",
        nameZh: "眉毛染色",
        price: 30,
      },
      {
        name: "Eyebrow Wax",
        nameZh: "眉型蜜蠟",
        price: 15,
      },
      {
        name: "Lip or Chin Wax",
        nameZh: "唇部或下巴蜜蠟",
        price: 10,
      },
    ],
  },
];

export const refillPolicy = [
  {
    withinDays: 7,
    fromDays: 4,
    label: "1 Week Refill",
    labelZh: "一週補睫",
    price: 40,
  },
  {
    withinDays: 14,
    fromDays: 8,
    label: "2 Week Refill",
    labelZh: "兩週補睫",
    price: 50,
  },
  {
    withinDays: 21,
    fromDays: 15,
    label: "3 Week Refill",
    labelZh: "三週補睫",
    price: 70,
  },
];

export const serviceCategories = {
  classic:   { labelEn: "Classic",             labelZh: "經典" },
  hybrid:    { labelEn: "Hybrid",              labelZh: "混合" },
  volume:    { labelEn: "Volume",              labelZh: "豐盈" },
  specialty: { labelEn: "Specialty",           labelZh: "特殊服務" },
  fill:      { labelEn: "Fills & Maintenance", labelZh: "補睫與維護" },
};
