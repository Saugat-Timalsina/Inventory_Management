function toNumber(n: unknown): number {
  if (n === null || n === undefined) return 0;
  if (typeof n === "number") return n;
  if (typeof n === "string") return Number(n);
  if (typeof n === "object" && n !== null && "toNumber" in n) {
    const fn = (n as { toNumber: () => number }).toNumber;
    if (typeof fn === "function") return fn.call(n);
  }
  return Number(n);
}

export function formatMoney(n: unknown, currency = "INR") {
  const v = toNumber(n);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(v);
}

export function formatDate(d: Date | string) {
  const x = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(x);
}

export function formatDateOnly(d: Date | string) {
  const x = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(x);
}
