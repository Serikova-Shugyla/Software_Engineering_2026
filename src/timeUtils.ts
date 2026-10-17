export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const period = h < 12 ? "AM" : "PM";
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

export function timeInputValue(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function timeInputToMinutes(val: string): number {
  const [h, m] = val.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return NaN;
  return h * 60 + m;
}

export function getNowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
