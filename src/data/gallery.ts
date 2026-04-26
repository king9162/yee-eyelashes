export type GalleryItem = {
  id: string;
  src: string;
  altEn: string;
  altZh: string;
  category: "classic" | "volume" | "hybrid" | "mega-volume" | "before-after";
  featured?: boolean;
};

export const galleryItems: GalleryItem[] = [
  { id: "g1",  src: "/images/19209.JPG",                  altEn: "Lash extensions by Yee Eyelashes",            altZh: "Yee Eyelashes 睫毛嫁接作品",   category: "volume",      featured: true },
  { id: "g2",  src: "/images/19211.JPG",                  altEn: "Volume lash set — Yee Eyelashes",             altZh: "豐盈款式睫毛嫁接",             category: "volume",      featured: true },
  { id: "g3",  src: "/images/19212.JPG",                  altEn: "Classic lash extensions Manhasset NY",        altZh: "經典款睫毛嫁接 紐約曼哈薩特",  category: "classic",     featured: true },
  { id: "g4",  src: "/images/19214.JPG",                  altEn: "Hybrid lash set — Yee Eyelashes",             altZh: "混合款睫毛嫁接",               category: "hybrid",      featured: true },
  { id: "g5",  src: "/images/19215.JPG",                  altEn: "Mega volume lash extensions",                 altZh: "超豐盈睫毛嫁接",               category: "mega-volume", featured: true },
  { id: "g6",  src: "/images/0416 Pic/DSC_0100.JPG",      altEn: "Lash extensions — Yee Eyelashes Manhasset",  altZh: "睫毛嫁接作品",                 category: "classic" },
  { id: "g7",  src: "/images/0416 Pic/DSC_0112.jpeg",     altEn: "Volume lash extensions close up",             altZh: "豐盈睫毛近照",                 category: "volume" },
  { id: "g8",  src: "/images/0416 Pic/DSC_0113.jpeg",     altEn: "Classic lash set full look",                  altZh: "經典款全套睫毛",               category: "classic" },
  { id: "g9",  src: "/images/0416 Pic/DSC_0114.JPG",      altEn: "Hybrid lash extensions — Manhasset NY",       altZh: "混合款睫毛嫁接",               category: "hybrid" },
  { id: "g10", src: "/images/0416 Pic/DSC_0115.jpeg",     altEn: "Mega volume lashes full set",                 altZh: "超豐盈全套睫毛",               category: "mega-volume" },
  { id: "g11", src: "/images/0416 Pic/DSC_0116.jpeg",     altEn: "Lash extensions detail shot",                 altZh: "睫毛嫁接細節",                 category: "volume" },
  { id: "g12", src: "/images/0416 Pic/DSC_0125.jpeg",     altEn: "Premium lash set — Yee Eyelashes",            altZh: "頂級睫毛嫁接",                 category: "classic" },
  { id: "g13", src: "/images/0416 Pic/DSC_0134.jpeg",     altEn: "Hybrid volume lash extensions",               altZh: "混合豐盈款式",                 category: "hybrid" },
  { id: "g14", src: "/images/0416 Pic/DSC_0152.jpeg",     altEn: "Full lash set — before and after",            altZh: "睫毛嫁接前後對比",             category: "before-after" },
  { id: "g15", src: "/images/0416 Pic/DSC_0157.JPG",      altEn: "Volume lashes — Yee Eyelashes NY",            altZh: "豐盈款睫毛嫁接",               category: "volume" },
  { id: "g16", src: "/images/0416 Pic/DSC_0158.jpeg",     altEn: "Classic lash extensions close up",            altZh: "經典款睫毛近照",               category: "classic" },
  { id: "g17", src: "/images/0416 Pic/DSC_0171.jpeg",     altEn: "Mega volume lash set — Manhasset",            altZh: "超豐盈款式",                   category: "mega-volume" },
];

export const galleryCategories = [
  { id: "all",           labelEn: "All",            labelZh: "全部" },
  { id: "classic",       labelEn: "Classic",        labelZh: "經典" },
  { id: "hybrid",        labelEn: "Hybrid",         labelZh: "混合" },
  { id: "volume",        labelEn: "Volume",         labelZh: "豐盈" },
  { id: "mega-volume",   labelEn: "Mega Volume",    labelZh: "超豐盈" },
  { id: "before-after",  labelEn: "Before & After", labelZh: "前後對比" },
] as const;

export type GalleryCategory = typeof galleryCategories[number]["id"];
