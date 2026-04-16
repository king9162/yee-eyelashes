export type GalleryItem = {
  id: string;
  src: string;
  altEn: string;
  altZh: string;
  category: "classic" | "volume" | "hybrid" | "mega-volume" | "before-after";
  featured?: boolean;
};

export const galleryItems: GalleryItem[] = [
  // ── Classic Set ──────────────────────────────────────────
  {
    id: "g1",
    src: "https://images.pexels.com/photos/21412169/pexels-photo-21412169.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&dpr=1&fit=crop",
    altEn: "Classic lash extension — natural look",
    altZh: "經典睫毛嫁接 — 自然妝感",
    category: "classic",
    featured: true,
  },
  {
    id: "g2",
    src: "https://images.pexels.com/photos/32039798/pexels-photo-32039798.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&dpr=1&fit=crop",
    altEn: "Classic lash extension — everyday look",
    altZh: "經典睫毛嫁接 — 日常妝感",
    category: "classic",
    featured: true,
  },
  {
    id: "g3",
    src: "https://images.pexels.com/photos/4124335/pexels-photo-4124335.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&dpr=1&fit=crop",
    altEn: "Classic lash extension — close up",
    altZh: "經典睫毛嫁接 — 近景",
    category: "classic",
  },

  // ── Hybrid Set ───────────────────────────────────────────
  {
    id: "g4",
    src: "https://images.pexels.com/photos/5871751/pexels-photo-5871751.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&dpr=1&fit=crop",
    altEn: "Hybrid lash extension — textured look",
    altZh: "混合睫毛嫁接 — 層次感",
    category: "hybrid",
    featured: true,
  },
  {
    id: "g5",
    src: "https://images.pexels.com/photos/19931500/pexels-photo-19931500.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&dpr=1&fit=crop",
    altEn: "Hybrid lash extension — full look",
    altZh: "混合睫毛嫁接 — 完整妝感",
    category: "hybrid",
  },

  // ── Volume Set ───────────────────────────────────────────
  {
    id: "g6",
    src: "https://images.pexels.com/photos/6962096/pexels-photo-6962096.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&dpr=1&fit=crop",
    altEn: "Volume lash extension — dramatic",
    altZh: "豐盈睫毛嫁接 — 戲劇感",
    category: "volume",
    featured: true,
  },
  {
    id: "g7",
    src: "https://images.pexels.com/photos/9409695/pexels-photo-9409695.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&dpr=1&fit=crop",
    altEn: "Volume lash extension — glamorous",
    altZh: "豐盈睫毛嫁接 — 魅力感",
    category: "volume",
    featured: true,
  },
  {
    id: "g8",
    src: "https://images.pexels.com/photos/5128316/pexels-photo-5128316.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&dpr=1&fit=crop",
    altEn: "Volume lash extension — wispy",
    altZh: "豐盈睫毛嫁接 — 輕盈感",
    category: "volume",
  },

  // ── Mega Volume ──────────────────────────────────────────
  {
    id: "g9",
    src: "https://images.pexels.com/photos/1510634/pexels-photo-1510634.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&dpr=1&fit=crop",
    altEn: "Mega volume lash extension",
    altZh: "超豐盈睫毛嫁接",
    category: "mega-volume",
    featured: true,
  },

  // ── Before & After ───────────────────────────────────────
  {
    id: "g10",
    src: "https://images.pexels.com/photos/32039798/pexels-photo-32039798.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=1&fit=crop",
    altEn: "Before lash extension",
    altZh: "嫁接前",
    category: "before-after",
  },
  {
    id: "g11",
    src: "https://images.pexels.com/photos/21412169/pexels-photo-21412169.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=1&fit=crop",
    altEn: "After volume lash extension",
    altZh: "嫁接後 — 豐盈款",
    category: "before-after",
  },
];

export const galleryCategories = [
  { id: "all",           labelEn: "All",            labelZh: "全部" },
  { id: "classic",       labelEn: "Classic",         labelZh: "經典" },
  { id: "hybrid",        labelEn: "Hybrid",          labelZh: "混合" },
  { id: "volume",        labelEn: "Volume",          labelZh: "豐盈" },
  { id: "mega-volume",   labelEn: "Mega Volume",     labelZh: "超豐盈" },
  { id: "before-after",  labelEn: "Before & After",  labelZh: "前後對比" },
] as const;

export type GalleryCategory = typeof galleryCategories[number]["id"];
