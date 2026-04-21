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
    reviewEn: "Betty is amazing. She's not just a lash artist; she really understands aesthetics. Before starting, she took the time to analyze my eye shape and patiently discussed what style would suit me best, rather than rushing into the service. That level of care is rare. The whole process was gentle, precise, and super relaxing. I went for a natural set, and the result exceeded my expectations: lightweight, soft, and perfectly balanced. It enhances my eyes without looking overdone.",
    reviewZh: "Betty is amazing. She's not just a lash artist; she really understands aesthetics. Before starting, she took the time to analyze my eye shape and patiently discussed what style would suit me best, rather than rushing into the service. That level of care is rare. The whole process was gentle, precise, and super relaxing. I went for a natural set, and the result exceeded my expectations: lightweight, soft, and perfectly balanced. It enhances my eyes without looking overdone.",
    rating: 5,
    service: "",
  },
  {
    id: "t2",
    nameEn: "Christine W.",
    nameZh: "Christine W.",
    reviewEn: "I drove from Garden City because of the reviews — worth every mile. Pristine studio, incredibly skilled artist, and lashes that made my husband do a double-take. I'm not going anywhere else.",
    reviewZh: "I drove from Garden City because of the reviews — worth every mile. Pristine studio, incredibly skilled artist, and lashes that made my husband do a double-take. I'm not going anywhere else.",
    rating: 5,
    service: "",
  },
  {
    id: "t3",
    nameEn: "Jennifer C.",
    nameZh: "Jennifer C.",
    reviewEn: "I'm so glad I found this cute lash spot. It's super convenient and literally right across from the Manhasset LIRR station. Betty did my lashes, and I love how they turned out natural, just the way I like them, and they lasted really well.",
    reviewZh: "I'm so glad I found this cute lash spot. It's super convenient and literally right across from the Manhasset LIRR station. Betty did my lashes, and I love how they turned out natural, just the way I like them, and they lasted really well.",
    rating: 5,
    service: "",
  },
  {
    id: "t4",
    nameEn: "Kiki S.",
    nameZh: "Kiki S.",
    reviewEn: "On my way to New York, I randomly picked this salon and was so glad I did. The place is new, clean, and comfortable. The service was excellent — friendly, patient, and professional. I chose a natural look and couldn't be happier with the result. Subtle, beautiful, and exactly what I wanted.",
    reviewZh: "On my way to New York, I randomly picked this salon and was so glad I did. The place is new, clean, and comfortable. The service was excellent — friendly, patient, and professional. I chose a natural look and couldn't be happier with the result. Subtle, beautiful, and exactly what I wanted.",
    rating: 5,
    service: "",
  },
];
