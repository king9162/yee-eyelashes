const SQUARE_BASE = "https://connect.squareup.com";
const LOCATION_ID = "LYH1D5CHJ3Q63";
const TEAM_MEMBER_ID = "TM4wYHn5QrACG4i6";

// Website serviceKey (card.id-variant.id) → Square service variation ID
const SERVICE_MAP: Record<string, string> = {
  // ── Mink / Silk ──────────────────────────────────────────────────────────
  "ms-60-ns":   "OG72RND5XBHBASHC3PBINXFT",
  "ms-60-w1":   "HZNBEAY5T5BNI6SM2BGRA4P5",
  "ms-60-w2":   "OOPOKRPFVZAHHA2JLL4GCFXU",
  "ms-60-w3":   "IMHZJPXHDXXIWI6HLWRVQIDE",
  "ms-60-pkg":  "URUHJ5VYOFV54VMVM7ERBCTK",

  "ms-80-ns":   "CXOHZSL3SSA6AMNMBZDWXG3Q",
  "ms-80-w1":   "Z4BEQRZCIVJGKLDUUOLTWNLE",
  "ms-80-w2":   "6GDONMYHVJH6WGOLIWBI6ZOU",
  "ms-80-w3":   "XEQGCETK6R4YC3FNVGOQTU5K",
  "ms-80-pkg":  "Z4HLXJUQB5REXZ4WYTKAVHKE",

  "ms-100-ns":  "XHIAMNVXC2K7NS56FTOK4NEU",
  "ms-100-w1":  "OJC7NPXUIJNJXTWGPW37F3MB",
  "ms-100-w2":  "LOPV5FLQEHSTGYWPGTK7MDCA",
  "ms-100-w3":  "4GAOFEM2PP7FRWAYAGHFC4XX",
  "ms-100-pkg": "2GD4BRPWBEXAGIW2FC3HC77I",

  "ms-120-ns":  "WCK3QOUOGMWZFJULT2JEAMEM",
  "ms-120-w1":  "R5POYOWISI6KXV6YUYXPGE3Q",
  "ms-120-w2":  "6ZTGYVIEIIDJZZUAOERSBJTT",
  "ms-120-w3":  "MAV6ZQRZ5OLZXJGFUXLDP6TP",
  "ms-120-pkg": "Q7Z2YFP7QNGQOAVAE7H3OQZ6",

  "ms-140-ns":  "XXABIYA3SVYNBBOGMPO6OSNN",
  "ms-140-w1":  "4BHWHNXQOTIDZATNX5YS3TKM",
  "ms-140-w2":  "AER4XB73ZP5X27JTG5NBNBTB",
  "ms-140-w3":  "FFZQ2C4NTIOHCFZ4RISEIR5Q",
  "ms-140-pkg": "I7ELO5RBQH6FQL5QYSS4YQAT",

  "ms-180-ns":  "HMVMS63SP7CVW5LOQZRRTNQ3",
  "ms-180-w1":  "CIIALHFKS2EVAP5N5VFW6S23",
  "ms-180-w2":  "47KOARFC3EXDMN4QMDHEHOIV",
  "ms-180-w3":  "4MLVTRCLT5GQ3HABV52VM5FV",
  "ms-180-pkg": "KR2OTRTENYGEOFBMPQSJWRPC",

  // ── Premium / Cashmere ───────────────────────────────────────────────────
  "pc-60-ns":   "WNTREDFQKEOIAFUPC44D6GUZ",
  "pc-60-w1":   "NPUYJMHNZBZOVH62GEHJJYKU",
  "pc-60-w2":   "X5DEDMTZLDBYJDKMZYM4UUQE",
  "pc-60-w3":   "7SCDD56MDK6CJSKTWPKBPOOF",
  "pc-60-pkg":  "ANIUGQSV2WXVANZVJFX3BSQQ",

  "pc-80-ns":   "UGP5A6MEQVEIGTKWO6KLJVJX",
  "pc-80-w1":   "HHC2T3OASN3KIPRPMCZQYUDK",
  "pc-80-w2":   "GVXD2DI52O2QWZATAYV3HXT2",
  "pc-80-w3":   "LD73AQAIHP3N4OSXUR42GF7G",
  "pc-80-pkg":  "Q6YOCJAOGFMVP7ESBHCCVGKI",

  "pc-100-ns":  "JX2Q7ISIC6SQUD3UPUJN72AP",
  "pc-100-w1":  "S2C2TTDJ6TTPHS7ZM6P5BSOQ",
  "pc-100-w2":  "VYFZEPM64KFFX4NVNDL6QDCC",
  "pc-100-w3":  "Z6VU4BMVW2ZV4XG5EC322NPF",
  "pc-100-pkg": "BEDO7GQCYHS6MMVVNQXRONJX",

  "pc-120-ns":  "MJS25LT4BGG7GGO6QH6RLAFZ",
  "pc-120-w1":  "NTGQUXWKFB6RUGBZJJEKSS5G",
  "pc-120-w2":  "NJJHDMBPF7MA2RER6GNBTRDA",
  "pc-120-w3":  "GK2JGP6FNBFU2M3MS3U5MUV2",
  "pc-120-pkg": "XFB4VOCF52XDUYZVRTB6JHGK",

  "pc-140-ns":  "H6FIG3FCZKTWIU3E5JBJDQT5",
  "pc-140-w1":  "D6C63HINRPNA2V6CUHJNL3MT",
  "pc-140-w2":  "7J7LDLSJCXJ3SWD2SPPJAQJ3",
  "pc-140-w3":  "PZV6XHVERIHSW3XB2RAS3WM4",
  "pc-140-pkg": "RKLOCN4NWBJCTFMBXEBI2IRV",

  "pc-180-ns":  "D5Y4MT3TSV2RVKYJQKLKLM2R",
  "pc-180-w1":  "WSAHZGVV7LF5ZSVEL4FA7NGJ",
  "pc-180-w2":  "4HIETMS3KVK3VWCD3H24IOJH",
  "pc-180-w3":  "FHZRRYB2AGS44CYJVFM6FJOE",
  "pc-180-pkg": "ETUDQKQY2EWBD4IB3GBMD563",

  // ── Fills & Care ─────────────────────────────────────────────────────────
  "refill-1w-only":    "UDXW67RT6SONU6U4UYB64YWJ",
  "refill-2w-only":    "22PAJGL3XC5AK7PLIJS6KHCQ",
  "refill-3w-only":    "PY2GK6JBY3IYFJU63C7JKAEP",
  "lash-lift-only":    "S6A2C7AEKVCI3VUOUB7DVO4K",
  "lash-tint-only":    "5WBZ26URQM336UJ3Y5KAZ4ME",
  "btm-tint-only":     "RZ2OW3NQPBW4DCJU5O7V6P3L",
  "tb-tint-only":      "OGNJSGYR3YVGW3ESZ5J46WGR",
  "brow-tint-only":    "FEZQIAMU6ZS2LKGS5AV6DYNV",
  "btm-ext-only":      "UFNMSB22DSZDU3HNCUFRKZMK",
  "color-ext-only":    "YHMFNOYEAKIMGWNAKP5NFHM7",
  "removal-only":      "NKL6HGUWXSYN2ZPVNDKIH55T",
  "brow-lam-all-only": "WHDVQO67CGE3XSG5ZY7CE3VP",
  "brow-lam-only":     "CUMFONRGQEXKQIYC2GYQ6FWJ",
  "wax-brow-only":     "EGWJE4UHQUN5C7VHS36RJB5F",
  "wax-cheeks-only":   "HVPLOKUZQB5DDAY3DZLBEG4S",
  "wax-chin-only":     "52RBWFNCVP5TYHX2FUTD7IX4",
  "wax-uplip-only":    "SKF7VCDAHL34GK5USZSZRHCD",
  "wax-lowlip-only":   "ZHC2QJRNG2V2RF3SH3XEMVVK",

  // ── PMU ──────────────────────────────────────────────────────────────────
  "microblading-only":  "JO4WHIGZ737W23PKB2SYW6E7",
  "combo-brows-only":   "ACIXUQW6MJ56QP445HSYF2SZ",
  "ombre-brows-only":   "JFBHKZHVBRD4IOMVZUHBEPAJ",
  "nano-brows-only":    "VEQSLIYDF5ETQFUZDSIB43NN",
  "brow-touchup-only":  "PHQI7TTTGF2JICDOWHM5KK6Y",
  "eyeliner-only":      "CQWIOOVZ7JL5LOFOZBYDMUXJ",
  "lash-enhance-only":  "VIV3BKOLQJ3JGRKUSYZM6JHL",
  "btm-liner-only":     "2DIMLEXJRALF27XBGL6YVRE6",
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
