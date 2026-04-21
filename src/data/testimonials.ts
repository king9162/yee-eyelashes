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
    nameEn: "Yu-Liang L.",
    nameZh: "Yu-Liang L.",
    reviewEn: "Betty is amazing — she really understands aesthetics. Before starting, she took the time to analyze my eye shape and discussed what style would suit me best. The result exceeded my expectations: lightweight, soft, and perfectly balanced. One of the best beauty experiences I've had in New York.",
    reviewZh: "Betty 真的很厲害，她真正懂得美學。在開始之前，她花時間分析我的眼型並討論最適合的風格。效果超乎我的預期：輕盈、柔軟、比例完美。這是我在紐約體驗過最棒的美妝服務之一。",
    rating: 5,
    service: "Classic Natural Set",
  },
  {
    id: "t2",
    nameEn: "Jennifer C.",
    nameZh: "Jennifer C.",
    reviewEn: "I'm so glad I found this cute lash spot — it's literally right across from the Manhasset LIRR station. Betty did my lashes and I love how they turned out. So natural, just the way I like it, and they lasted longer than any set I've had before.",
    reviewZh: "好開心找到這個地方——就在 Manhasset LIRR 站對面，超方便。Betty 幫我做的睫毛我非常喜歡，非常自然，正是我想要的效果，而且持妝比我之前做的任何一次都久。",
    rating: 5,
    service: "Classic Set",
  },
  {
    id: "t3",
    nameEn: "Kiki S.",
    nameZh: "Kiki S.",
    reviewEn: "I randomly picked this salon on my way through New York, and it turned out to be such a great find. The place is brand new, clean, and bright. I went with a natural look and I'm extremely happy with the result — subtle yet beautiful. I'll definitely come back.",
    reviewZh: "我在路過紐約時隨機選了這家，沒想到意外驚喜。工作室全新、乾淨、明亮。選了自然款，效果讓我非常滿意——低調又美麗。下次一定再來。",
    rating: 5,
    service: "Natural Lash Set",
  },
  {
    id: "t4",
    nameEn: "Muna B.",
    nameZh: "Muna B.",
    reviewEn: "I went for a lash lift and it was such a good experience from start to finish. Super clean, organized, and calming. They even offered me a waffle and water — such a thoughtful touch. The results are incredible and I will definitely be back.",
    reviewZh: "去做了睫毛燙翹，從頭到尾都是很棒的體驗。超乾淨、整潔、讓人放鬆。他們還提供了鬆餅和水——這樣貼心的細節真的讓人感動。效果棒極了，我一定會再來。",
    rating: 5,
    service: "Lash Lift",
  },
];
