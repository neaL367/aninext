export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatTimezoneLabel(timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(new Date());
    const tzName = parts.find((p) => p.type === "timeZoneName")?.value;
    return tzName ? `${timeZone} (${tzName})` : timeZone;
  } catch {
    return timeZone;
  }
}

export function formatLocalDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }
): string {
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function formatLocalTime(timestampSeconds: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestampSeconds * 1000));
}

export function formatLocalDateTime(timestampSeconds: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestampSeconds * 1000));
}

export function toLocalDateKey(timestampSeconds: number): string {
  const d = new Date(timestampSeconds * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getRelativeDayLabel(dateKey: string, now = new Date()): string {
  const todayKey = toLocalDateKey(Math.floor(now.getTime() / 1000));
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = toLocalDateKey(Math.floor(tomorrow.getTime() / 1000));

  if (dateKey === todayKey) return "Today";
  if (dateKey === tomorrowKey) return "Tomorrow";

  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y!, m! - 1, d);
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
}

export function formatRelativeAiringTime(
  timestampSeconds: number,
  now = new Date()
): string {
  const nowMs = now.getTime();
  const targetMs = timestampSeconds * 1000;
  const diffMs = targetMs - nowMs;
  const diffHours = Math.round(diffMs / 3_600_000);

  const dateKey = toLocalDateKey(timestampSeconds);
  const dayLabel = getRelativeDayLabel(dateKey, now);

  if (diffMs < 0) {
    return formatLocalTime(timestampSeconds);
  }

  if (diffHours < 1 && diffMs >= 0) {
    const mins = Math.max(1, Math.round(diffMs / 60_000));
    return `In ${mins} min`;
  }

  if (diffHours < 24 && dayLabel === "Today") {
    return `In ${diffHours} hr`;
  }

  if (dayLabel === "Today" || dayLabel === "Tomorrow") {
    return `${dayLabel} · ${formatLocalTime(timestampSeconds)}`;
  }

  return `${dayLabel} · ${formatLocalTime(timestampSeconds)}`;
}

export function groupByLocalDate<T extends { airingAt: number }>(
  items: readonly T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  const sorted = [...items].sort((a, b) => a.airingAt - b.airingAt);

  for (const item of sorted) {
    const key = toLocalDateKey(item.airingAt);
    const list = grouped.get(key) ?? [];
    list.push(item);
    grouped.set(key, list);
  }

  return grouped;
}
