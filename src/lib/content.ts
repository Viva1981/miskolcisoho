import "server-only";

import { unstable_cache } from "next/cache";

import { getAdminContent } from "@/lib/admin-content";

export type AccentTone =
  | "lime"
  | "blue"
  | "violet"
  | "sunset"
  | "graphite"
  | "emerald";

export type HomepageEvent = {
  id: string;
  title: string;
  date: string;
  dateEnd?: string;
  time?: string;
  timeEnd?: string;
  dateLabel: string;
  timeLabel: string;
  accent: AccentTone;
  facebookUrl: string;
  coverImageUrl?: string;
};

export type FacebookFeedItem = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
  tone: AccentTone;
  coverImageUrl?: string;
};

const tones: AccentTone[] = ["lime", "blue", "violet", "sunset", "graphite", "emerald"];

const mockHomepageEvents: HomepageEvent[] = [
  {
    id: "dummy-1",
    title: "Húsvéti Vén Teenager Party",
    date: "2026-04-03",
    time: "20:00",
    dateLabel: "2026-04-03",
    timeLabel: "20:00",
    accent: "emerald",
    facebookUrl: "https://fb.me/e/3lJC1LLFD",
  },
  {
    id: "dummy-2",
    title: "Csajpéntek",
    date: "2026-04-10",
    time: "22:00",
    dateLabel: "2026-04-10",
    timeLabel: "22:00",
    accent: "sunset",
    facebookUrl: "https://fb.me/e/8hWvC5sVa",
  },
  {
    id: "dummy-3",
    title: "Nagy Bogi Lemezbemutató",
    date: "2026-04-17",
    time: "20:00",
    dateLabel: "2026-04-17",
    timeLabel: "20:00",
    accent: "blue",
    facebookUrl: "https://www.facebook.com/profile.php?id=61575425759586&locale=hu_HU",
  },
  {
    id: "dummy-4",
    title: "Soho Opening Night",
    date: "2026-04-24",
    time: "21:00",
    dateLabel: "2026-04-24",
    timeLabel: "21:00",
    accent: "violet",
    facebookUrl: "https://www.facebook.com/profile.php?id=61575425759586&locale=hu_HU",
  },
  {
    id: "dummy-5",
    title: "Retro City Lights",
    date: "2026-05-01",
    time: "22:30",
    dateLabel: "2026-05-01",
    timeLabel: "22:30",
    accent: "graphite",
    facebookUrl: "https://www.facebook.com/profile.php?id=61575425759586&locale=hu_HU",
  },
];

const mockFacebookFeedItems: FacebookFeedItem[] = [
  {
    id: "event-1",
    eyebrow: "Facebook",
    title: "Hétvégi nyitó est",
    subtitle: "",
    href: "https://fb.me/e/3lJC1LLFD",
    tone: "lime",
  },
  {
    id: "event-2",
    eyebrow: "Facebook",
    title: "Soho night session",
    subtitle: "",
    href: "https://fb.me/e/8hWvC5sVa",
    tone: "blue",
  },
  {
    id: "post-1",
    eyebrow: "Facebook",
    title: "Klubpillanatok",
    subtitle: "",
    href: "https://www.facebook.com/permalink.php?story_fbid=pfbid0h1oLuAHyUKjYGaiPyFdr6Q98pMWwxuFWkqD39rHufsFwAP7oKP9mwKYNLPETbKCzl&id=61575425759586",
    tone: "violet",
  },
];

function getTone(index: number): AccentTone {
  return tones[index % tones.length];
}

function isPublished(value: string | undefined) {
  return String(value ?? "").trim().toLowerCase() === "true";
}

function toSortOrder(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeValue(value: string | undefined) {
  return String(value ?? "").trim();
}

function buildDateLabel(start: string, end?: string) {
  const normalizedStart = normalizeValue(start);
  const normalizedEnd = normalizeValue(end);

  if (!normalizedStart) {
    return "";
  }

  if (!normalizedEnd || normalizedEnd === normalizedStart) {
    return normalizedStart;
  }

  return `${normalizedStart} - ${normalizedEnd}`;
}

function buildTimeLabel(start?: string, end?: string) {
  const normalizedStart = normalizeValue(start);
  const normalizedEnd = normalizeValue(end);

  if (!normalizedStart && !normalizedEnd) {
    return "";
  }

  if (normalizedStart && !normalizedEnd) {
    return normalizedStart;
  }

  if (!normalizedStart && normalizedEnd) {
    return normalizedEnd;
  }

  if (normalizedStart === normalizedEnd) {
    return normalizedStart;
  }

  return `${normalizedStart} - ${normalizedEnd}`;
}

export function getDriveThumbnailUrl(fileId: string | undefined, size = 1200) {
  const normalized = String(fileId ?? "").trim();

  if (!normalized) {
    return "";
  }

  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(normalized)}&sz=w${size}`;
}

export function getDrivePreviewUrl(fileId: string | undefined) {
  const normalized = String(fileId ?? "").trim();

  if (!normalized) {
    return "";
  }

  return `https://drive.google.com/file/d/${encodeURIComponent(normalized)}/view`;
}

const getCachedEventsContent = unstable_cache(
  async () => getAdminContent("events"),
  ["public-events-content"],
  { revalidate: 60, tags: ["public-events-content"] },
);

const getCachedFacebookFeedContent = unstable_cache(
  async () => getAdminContent("facebook_feed"),
  ["public-facebook-feed-content"],
  { revalidate: 60, tags: ["public-facebook-feed-content"] },
);

export async function getHomepageEvents() {
  const result = await getCachedEventsContent();

  if (process.env.NODE_ENV !== "production" && (!result.ok || result.source === "mock")) {
    return mockHomepageEvents;
  }

  if (!result.ok || result.source === "mock") {
    return [];
  }

  const mapped = result.data
    .filter((row) => isPublished(row.published))
    .sort((a, b) => toSortOrder(a.sort_order, 9999) - toSortOrder(b.sort_order, 9999))
    .map((row, index) => {
      const date = normalizeValue(row.date);
      const dateEnd = normalizeValue(row.date_end);
      const time = normalizeValue(row.time);
      const timeEnd = normalizeValue(row.time_end);

      return {
        id: row.id || `event-${index + 1}`,
        title: row.title || "Esemény",
        date,
        dateEnd: dateEnd || undefined,
        time: time || undefined,
        timeEnd: timeEnd || undefined,
        dateLabel: buildDateLabel(date, dateEnd),
        timeLabel: buildTimeLabel(time, timeEnd),
        accent: getTone(index),
        facebookUrl: row.facebook_url || "#",
        coverImageUrl: getDriveThumbnailUrl(row.cover_drive_file_id, 1600),
      };
    });

  return mapped.length > 0 ? mapped : mockHomepageEvents;
}

export async function getFacebookFeedItems() {
  const result = await getCachedFacebookFeedContent();

  if (process.env.NODE_ENV !== "production" && (!result.ok || result.source === "mock")) {
    return mockFacebookFeedItems;
  }

  if (!result.ok || result.source === "mock") {
    return [];
  }

  const mapped = result.data
    .filter((row) => isPublished(row.published))
    .sort((a, b) => toSortOrder(a.sort_order, 9999) - toSortOrder(b.sort_order, 9999))
    .map((row, index) => ({
      id: row.id || `feed-${index + 1}`,
      eyebrow: "Facebook",
      title: row.title || "Facebook tartalom",
      subtitle: "",
      href: row.facebook_url || "#",
      tone: getTone(index),
      coverImageUrl: getDriveThumbnailUrl(row.cover_drive_file_id, 1200),
    }));

  return mapped.length > 0 ? mapped : mockFacebookFeedItems;
}
