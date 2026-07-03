const NY = "America/New_York";

/** Today's date in New York timezone as YYYY-MM-DD */
export const todayNY = (): string =>
  new Date().toLocaleDateString("en-CA", { timeZone: NY });

/** Offset a YYYY-MM-DD string by N days, returning YYYY-MM-DD */
export const offsetDateNY = (yyyymmdd: string, days: number): string => {
  const d = new Date(yyyymmdd + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA", { timeZone: NY });
};

/** Current NY time as { mm, dd } zero-padded strings (for birthday matching) */
export const todayMMDD = (): string => {
  const now = new Date();
  const mm = String(parseInt(now.toLocaleString("en-US", { timeZone: NY, month: "numeric" }))).padStart(2, "0");
  const dd = String(parseInt(now.toLocaleString("en-US", { timeZone: NY, day:   "numeric" }))).padStart(2, "0");
  return `${mm}/${dd}`;
};
