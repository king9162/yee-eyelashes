const SQUARE_BASE = "https://connect.squareup.com";
const LOCATION_ID = "LYH1D5CHJ3Q63";
const TEAM_MEMBER_ID = "TM4wYHn5QrACG4i6";

// Website serviceKey (card.id-variant.id) → Square service variation ID
const SERVICE_MAP: Record<string, string> = {
  // ── Mink / Silk → Classic ────────────────────────────────────────────────
  "ms-60-ns":   "4C2NTZNUKOYQ6EL7PEO7BGNR",
  "ms-60-w1":   "YOHECGJQEG3H2IXYF4MTJ3QJ",
  "ms-60-w2":   "FDNO7VZ2STRWR5FKAFA33AKL",
  "ms-60-w3":   "J6LJJS6FEBJ6XXBQULPF47XA",
  "ms-60-pkg":  "XZARZVN6YPDDQ7TBEQTZSAJU",

  "ms-80-ns":   "Q7FLCHUEW26Q7LIUG744KXQ2",
  "ms-80-w1":   "AZZETX7BN5VE3AFR7FAS4BKL",
  "ms-80-w2":   "FQDGPI4FE2BTYEB22BBZ7JYX",
  "ms-80-w3":   "EHXUFT6W43ONCJ4HPF4R7MC7",
  "ms-80-pkg":  "DB2MKJQ6JOTTY6AZEBXVR3QJ",

  "ms-100-ns":  "27KROUKNWHR7J6OJRFJWAVHM",
  "ms-100-w1":  "VI3DOX2IOHP6UU3KF5QZ6U3A",
  "ms-100-w2":  "7JE36UW2ZIUDTMYBP2EMAKWW",
  "ms-100-w3":  "GNA45CRXHTRT5J6X3XLFTKYZ",
  "ms-100-pkg": "N2IMAXJ6EZV24YLOJKQVEUWF",

  "ms-120-ns":  "A367TGZS7HSQUDCIOXTHCFFJ",
  "ms-120-w1":  "3VQYJUCPROMDWZBIVLORCHSO",
  "ms-120-w2":  "GF3WXBYYBKZTNJKUIYRDPYJS",
  "ms-120-w3":  "P2HKM3HUYDDCCSU2LODGDL2N",
  "ms-120-pkg": "RCA3U6J5IVM6TOWJSXJ5PSNK",

  "ms-140-ns":  "ZIIVSVVGNZBRXA2CG3BGUATK",
  "ms-140-w1":  "7DBFED6XR7DRWRWMFSN6RIMG",
  "ms-140-w2":  "G2CCAVEGZGR4FHB455XGSE5P",
  "ms-140-w3":  "VQFMZXS3SQPWUZJH75PSVXNA",
  "ms-140-pkg": "MTH7KMNGCVTE6MNFMDAMHAAN",

  "ms-180-ns":  "BVM3NMXMYB7BXPBEZAQIJJLF",
  "ms-180-w1":  "KW7ZJPZGPQ2LZESQQDOYUMEF",
  "ms-180-w2":  "KQZOYD4TAMMWG34NZRNNH2A5",
  "ms-180-w3":  "TUYNPTYRI7BNW5BXOA42QMZW",
  "ms-180-pkg": "EVTZ7IA4SC4Q3TD76MACXF7G",

  // ── Premium / Cashmere → Premium ────────────────────────────────────────
  "pc-60-ns":   "OV2W62U2JGTGPOZK7O6CJPW3",
  "pc-60-w1":   "JJGSSUKKKJWW4J3FIS544W42",
  "pc-60-w2":   "FLEO3DBCQPTQE2NNN3BKI3QC",
  "pc-60-w3":   "UTXB7MZIH4NSVYVMF26W7MWY",
  "pc-60-pkg":  "HFCLVP63Z3FB3AGS6TUILU5E",

  "pc-80-ns":   "2TPTG4EICOP4O2CTTSV43U4M",
  "pc-80-w1":   "ADKXO5O6G4DWGQOXSL7MIPCN",
  "pc-80-w2":   "VMCMDH6RETSJXMES55AEQ335",
  "pc-80-w3":   "DWFJSXHMQ4R5KZNESDIIYTBE",
  "pc-80-pkg":  "VWNKYZF4VCMSUXG2HGNOA4RN",

  "pc-100-ns":  "SDYFPVD7B5JUDDGOWV7KOUD7",
  "pc-100-w1":  "A4X45I3SR23WBT6QT5X2KQ6I",
  "pc-100-w2":  "R6LVQ62EPPWSL45JNO53CO7R",
  "pc-100-w3":  "RBXENOD7E7Z6YEYS75UBLNAR",
  "pc-100-pkg": "TRCYFKB4SBRQ66U2VQFRUDBC",

  "pc-120-ns":  "JZOYZQ6L3BIKR5ZS35X2I5I3",
  "pc-120-w1":  "TEMSQGY7N42MPRT6XSHBZAUB",
  "pc-120-w2":  "STOOADIA4WGZ7DH2LVOC3XX3",
  "pc-120-w3":  "I7YESB64ZJUKAISRBO7DKLKT",
  "pc-120-pkg": "JUBM4LOEGP4FQYFMPYCUAXFE",

  "pc-140-ns":  "3GOYDJGSIC5YSHXP2LYKLDOR",
  "pc-140-w1":  "BQXIRDI223TNQNPB4YWVXNRU",
  "pc-140-w2":  "WYYOHRJ3E4VMEWHGV2CXAYUV",
  "pc-140-w3":  "UZRY2WMKJ6ZENANA3UQROJ4N",
  "pc-140-pkg": "U7US7WP45UGU4I7JIP6Z4CBJ",

  "pc-180-ns":  "RVSCT3QQCMKYXUB6KUMKXGPU",
  "pc-180-w1":  "UMCR2N6BLHP663J2EYMCBRV3",
  "pc-180-w2":  "XVL5HSVRWK2XNK3SBLOM5BVN",
  "pc-180-w3":  "AM6D6JNYCV25P45HUZCWVP33",
  "pc-180-pkg": "W3X2O2RDNCF5NP73AXAHJJYE",

  // ── Fills & Care ─────────────────────────────────────────────────────────
  "refill-1w-only":    "RAF67WIL4WQ2LICHTVJF64T5",
  "refill-2w-only":    "UENOVZFBHXCLLKWIO4VIRF3P",
  "refill-3w-only":    "DWT6WVFOMKE37FBR6IFJT7YF",
  "lash-lift-only":    "FI2OMSQGSL6HYZGDD3CFNNZW",
  "lash-tint-only":    "OCMRIAWL44UMAHRHGWJSOHDX",
  "btm-tint-only":     "TZQCIKJ4TESDPJ34QEHAMLDY",
  "tb-tint-only":      "6QXDRGUX5GQFC22EKZRVSX7G",
  "brow-tint-only":    "N7GQ7QCME35GOFME7V5C6NQ3",
  "btm-ext-only":      "YTZOHZG4OS54YHM6WASXNJ2R",
  "color-ext-only":    "M7GAP7PEICZSNHFCOFIKEX6Q",
  "removal-only":      "RFXSUOS3BORDEAR7NFMXZLHK",
  "brow-lam-all-only": "INPUXACTYQDEYMUROKV6DERD",
  "brow-lam-only":     "LCXKIQ4MHDIRVMB6KUPFXHJE",
  "wax-brow-only":     "TFYBR5Z6P364XKKEQJ7FPTYC",
  "wax-cheeks-only":   "E7KETQBVH27ZDT27MVMHM7KO",
  "wax-chin-only":     "Y3JR4337DUM2SZ3URJCWIK5P",
  "wax-uplip-only":    "6KUN4P4JSISOP4HHXPNM5JAZ",
  "wax-lowlip-only":   "MKYZMBJWC2V6D3YIBUX5S6VF",

  // ── PMU ──────────────────────────────────────────────────────────────────
  "microblading-only":  "HKC3TN7D3P2JYE5TMKG7KY7M",
  "combo-brows-only":   "SBRT5DFQCCZ7CJRLYBQ34JTK",
  "ombre-brows-only":   "LUUUQEE34M2K73EW3QLE6DRA",
  "nano-brows-only":    "NISF2KNDWSVC7YHU6AW2NVDF",
  "brow-touchup-only":  "4BTNNTP2LGIEKID5ZXCVM6GJ",
  "lip-touchup-only":   "XIMJ547NUNOQGVGY4SX4IKQQ",
  "eyeliner-only":      "RKU4XB4RAXOYA4QB5G4X5VJA",
  "lash-enhance-only":  "TTKQPGS6WU364ONCZLREFK6C",
  "btm-liner-only":     "JXPP6KHCBPLYDDKLZODMPQ5K",
};

function toSquareStartAt(date: string, time: string): string {
  const [hhmm, ampm] = time.split(" ");
  let [h, m] = hhmm.split(":").map(Number);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;

  // Determine NY UTC offset by probing noon UTC on that date
  const probe = new Date(`${date}T12:00:00Z`);
  const nyHour = parseInt(
    probe.toLocaleString("en-US", { timeZone: "America/New_York", hour: "2-digit", hour12: false })
  );
  const offsetHours = 12 - nyHour; // 5 for EST, 4 for EDT

  return new Date(Date.UTC(
    parseInt(date.slice(0, 4)),
    parseInt(date.slice(5, 7)) - 1,
    parseInt(date.slice(8, 10)),
    h + offsetHours,
    m,
    0
  )).toISOString();
}

export async function createSquareBooking({
  serviceKey,
  durationMin,
  date,
  time,
  customerName,
  customerEmail,
  customerPhone,
  notes,
}: {
  serviceKey: string;
  durationMin: number;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string | null;
}): Promise<string | null> {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) return null;

  const variationId = SERVICE_MAP[serviceKey];
  if (!variationId) {
    console.warn(`[Square] No mapping for service key: ${serviceKey}`);
    return null;
  }

  // Fetch current catalog object version (required by Square Bookings API)
  const catRes = await fetch(`${SQUARE_BASE}/v2/catalog/object/${variationId}`, {
    headers: { Authorization: `Bearer ${token}`, "Square-Version": "2024-11-20" },
  });
  const catData = await catRes.json();
  const version = catData.object?.version;
  if (!version) {
    console.error("[Square] Could not fetch catalog object version for", variationId);
    return null;
  }

  const startAt = toSquareStartAt(date, time);
  const customerNote = [
    `Phone: ${customerPhone}`,
    `Email: ${customerEmail}`,
    notes ? `Notes: ${notes}` : "",
  ].filter(Boolean).join(" | ");

  const res = await fetch(`${SQUARE_BASE}/v2/bookings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-11-20",
    },
    body: JSON.stringify({
      idempotency_key: `website-${date}-${time.replace(/\s/g, "")}-${serviceKey}-${Date.now()}`,
      booking: {
        start_at: startAt,
        location_id: LOCATION_ID,
        customer_note: customerNote,
        appointment_segments: [{
          duration_minutes: durationMin,
          service_variation_id: variationId,
          service_variation_version: version,
          team_member_id: TEAM_MEMBER_ID,
        }],
      },
    }),
  });

  const data = await res.json();
  if (data.errors) {
    console.error("[Square] Create booking error:", JSON.stringify(data.errors));
    return null;
  }
  return data.booking?.id ?? null;
}
