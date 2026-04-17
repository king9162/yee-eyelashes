export type GalleryItem = {
  id: string;
  src: string;
  altEn: string;
  altZh: string;
  category: "classic" | "volume" | "hybrid" | "mega-volume" | "before-after";
  featured?: boolean;
};

// Photos coming soon — add real images here when ready
export const galleryItems: GalleryItem[] = [];

export const galleryCategories = [
  { id: "all",           labelEn: "All",            labelZh: "全部" },
  { id: "classic",       labelEn: "Classic",         labelZh: "經典" },
  { id: "hybrid",        labelEn: "Hybrid",          labelZh: "混合" },
  { id: "volume",        labelEn: "Volume",           labelZh: "豐盈" },
  { id: "mega-volume",   labelEn: "Mega Volume",     labelZh: "超豐盈" },
  { id: "before-after",  labelEn: "Before & After",  labelZh: "前後對比" },
] as const;

export type GalleryCategory = typeof galleryCategories[number]["id"];
