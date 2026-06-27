export type PcsOption = {
  label: string;
  price: number;
  duration?: string;
};

export type BookingItem = {
  id:         string;
  name:       string;
  nameZh:     string;
  duration:   string;
  pcsOptions: PcsOption[] | null;
  flatPrice:  number | null;
  note?:      string;
};

export type BookingCategory = {
  id:      string;
  name:    string;
  nameZh:  string;
  items:   BookingItem[];
};

export const bookingCategories: BookingCategory[] = [
  {
    id: "mink", name: "Real Mink", nameZh: "Mink / Silk",
    items: [
      { id: "mink-new-set", name: "New Set",        nameZh: "新接全套", duration: "1 hr+",
        flatPrice: null,
        pcsOptions: [{ label:"60pcs",price:60},{label:"80pcs",price:80},{label:"100pcs",price:100},{label:"120pcs",price:120}] },
      { id: "mink-1w",      name: "1 Week Refill",  nameZh: "一週補睫", duration: "1 hr+",
        flatPrice: null,
        pcsOptions: [{ label:"60pcs",price:30},{label:"80pcs",price:40},{label:"100pcs",price:45},{label:"120pcs",price:55}] },
      { id: "mink-2w",      name: "2 Week Refill",  nameZh: "兩週補睫", duration: "1 hr+",
        flatPrice: null,
        pcsOptions: [{ label:"60pcs",price:40},{label:"80pcs",price:50},{label:"100pcs",price:55},{label:"120pcs",price:65}] },
      { id: "mink-3w",      name: "3 Week Refill",  nameZh: "三週補睫", duration: "1 hr+",
        flatPrice: null,
        pcsOptions: [{ label:"60pcs",price:50},{label:"80pcs",price:70},{label:"100pcs",price:75},{label:"120pcs",price:85}] },
      { id: "mink-3x",      name: "3× Package",     nameZh: "三次套餐", duration: "1 hr+",
        flatPrice: null,
        pcsOptions: [{ label:"60pcs",price:150},{label:"80pcs",price:190},{label:"100pcs",price:240},{label:"120pcs",price:280}] },
    ],
  },
  {
    id: "premium", name: "Premium / Cashmere", nameZh: "Premium / Cashmere",
    items: [
      { id: "prem-new-set", name: "New Set",        nameZh: "新接全套", duration: "1 hr+",
        flatPrice: null,
        pcsOptions: [{ label:"60pcs",price:80},{label:"80pcs",price:100},{label:"100pcs",price:120},{label:"120pcs",price:130},{label:"Design Style",price:130}] },
      { id: "prem-1w",      name: "1 Week Refill",  nameZh: "一週補睫", duration: "1 hr+",
        flatPrice: null,
        pcsOptions: [{ label:"60pcs",price:45},{label:"80pcs",price:50},{label:"100pcs",price:60},{label:"120pcs",price:70},{label:"Design Style",price:70}] },
      { id: "prem-2w",      name: "2 Week Refill",  nameZh: "兩週補睫", duration: "1 hr+",
        flatPrice: null,
        pcsOptions: [{ label:"60pcs",price:55},{label:"80pcs",price:60},{label:"100pcs",price:69},{label:"120pcs",price:79},{label:"Design Style",price:79}] },
      { id: "prem-3w",      name: "3 Week Refill",  nameZh: "三週補睫", duration: "1 hr+",
        flatPrice: null,
        pcsOptions: [{ label:"60pcs",price:65},{label:"80pcs",price:70},{label:"100pcs",price:79},{label:"120pcs",price:105},{label:"Design Style",price:89}] },
      { id: "prem-3x",      name: "3× Package",     nameZh: "三次套餐", duration: "1 hr+",
        flatPrice: null,
        pcsOptions: [{ label:"60pcs",price:200},{label:"80pcs",price:240},{label:"100pcs",price:280},{label:"120pcs",price:320},{label:"Design Style",price:320}] },
    ],
  },
  {
    id: "3d", name: "3D Lashes", nameZh: "3D 睫毛",
    items: [
      { id: "3d-new-set", name: "New Set",        nameZh: "新接全套", duration: "1 hr 30 min+",
        flatPrice: null,
        pcsOptions: [{ label:"140pcs",price:150},{label:"180pcs",price:170}] },
      { id: "3d-1w",      name: "1 Week Refill",  nameZh: "一週補睫", duration: "1 hr 30 min+",
        flatPrice: null,
        pcsOptions: [{ label:"140pcs",price:85},{label:"180pcs",price:95}] },
      { id: "3d-2w",      name: "2 Week Refill",  nameZh: "兩週補睫", duration: "1 hr 30 min+",
        flatPrice: null,
        pcsOptions: [{ label:"140pcs",price:95},{label:"180pcs",price:105}] },
      { id: "3d-3w",      name: "3 Week Refill",  nameZh: "三週補睫", duration: "1 hr 30 min+",
        flatPrice: null,
        pcsOptions: [{ label:"140pcs",price:115},{label:"180pcs",price:125}] },
      { id: "3d-3x",      name: "3× Package",     nameZh: "三次套餐", duration: "1 hr 30 min+",
        flatPrice: null,
        pcsOptions: [{ label:"140pcs",price:360},{label:"180pcs",price:420}] },
    ],
  },
  {
    id: "care-pmu", name: "Care & PMU", nameZh: "護理與紋繡",
    items: [
      {
        id: "lash-lift-tint", name: "Lash Lift & Tint", nameZh: "睫毛燙翹染色",
        duration: "45 min", flatPrice: null,
        pcsOptions: [
          { label: "Eyelash Lift",    price: 79, duration: "45 min" },
          { label: "Eyelash Tinting", price: 20, duration: "20 min" },
          { label: "Eyebrow Tinting", price: 30, duration: "20 min" },
        ],
      },
      {
        id: "lash-ext-removal", name: "Eyelash Extension & Removal", nameZh: "睫毛嫁接與卸除",
        duration: "20 min", flatPrice: null,
        pcsOptions: [
          { label: "Bottom Lash Ext.", price: 30, duration: "30 min" },
          { label: "Color Lash Ext.",  price: 25, duration: "20 min" },
          { label: "Eyelash Removal",  price: 20, duration: "20 min" },
        ],
      },
    ],
  },
  {
    id: "other", name: "Other", nameZh: "其他",
    items: [
      { id: "phone-appt", name: "Phone Appointment", nameZh: "電話預約",
        duration: "1 hr 30 min", flatPrice: null,
        pcsOptions: [{ label: "Phone Appointment", price: 0, duration: "1 hr 30 min" }] },
    ],
  },
];
