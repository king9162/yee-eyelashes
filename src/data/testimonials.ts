export type Testimonial = {
  id: string;
  nameEn: string;
  nameZh: string;
  reviewEn: string;
  reviewZh: string;
  rating: number;
  service: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    nameEn: "Michelle K.",
    nameZh: "Michelle K.",
    reviewEn: "I've been to studios in Manhattan, but Yee Eyelashes is on a completely different level. My volume set is flawless — everyone assumes I woke up like this. The attention to detail is unlike anything I've experienced.",
    reviewZh: "我去過曼哈頓的工作室，但 Yee Eyelashes 完全不是同一個層次。我的豐盈款簡直完美無瑕——每個人都以為我天生就是這樣。對細節的用心程度是我從未體驗過的。",
    rating: 5,
    service: "Volume Full Set",
  },
  {
    id: "t2",
    nameEn: "Jennifer L.",
    nameZh: "Jennifer L.",
    reviewEn: "The consultation alone sold me. She studied my eye shape before touching a single lash. The hybrid set she designed for me is the most natural, beautiful thing I've ever worn on my face.",
    reviewZh: "光是諮詢過程就讓我信服了。她在接上第一根睫毛之前，先仔細研究了我的眼型。她為我設計的混合款是我臉上戴過最自然、最美麗的東西。",
    rating: 5,
    service: "Hybrid Full Set",
  },
  {
    id: "t3",
    nameEn: "Ashley R.",
    nameZh: "Ashley R.",
    reviewEn: "As someone with sparse natural lashes, I never believed extensions could look this good on me. Three weeks later they still look brand new. Best beauty investment I've made in years — worth every penny.",
    reviewZh: "作為一個天然睫毛稀疏的人，我從不相信嫁接睫毛能在我臉上呈現這麼好的效果。三週後依然像剛做完一樣。這是我多年來最值得的美容投資——每一分都值得。",
    rating: 5,
    service: "Classic Signature",
  },
  {
    id: "t4",
    nameEn: "Christine W.",
    nameZh: "Christine W.",
    reviewEn: "I drove from Garden City because of the reviews — worth every mile. Pristine studio, incredibly skilled artist, and lashes that made my husband do a double take. I'm not going anywhere else.",
    reviewZh: "我從 Garden City 專程開車過來，因為那些評價——每一英里都值得。工作室一塵不染，技術師技藝精湛，做完的睫毛讓我丈夫看了又看。我不會再去別的地方了。",
    rating: 5,
    service: "Volume Full Set",
  },
];
