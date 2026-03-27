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
  time: string;
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
    accent: "emerald",
    facebookUrl: "https://fb.me/e/3lJC1LLFD",
  },
  {
    id: "dummy-2",
    title: "Csajpéntek",
    date: "2026-04-10",
    time: "22:00",
    accent: "sunset",
    facebookUrl: "https://fb.me/e/8hWvC5sVa",
  },
  {
    id: "dummy-3",
    title: "Nagy Bogi Lemezbemutató",
    date: "2026-04-17",
    time: "20:00",
    accent: "blue",
    facebookUrl: "https://www.facebook.com/profile.php?id=61575425759586&locale=hu_HU",
  },
  {
    id: "dummy-4",
    title: "Soho Opening Night",
    date: "2026-04-24",
    time: "21:00",
    accent: "violet",
    facebookUrl: "https://www.facebook.com/profile.php?id=61575425759586&locale=hu_HU",
  },
  {
    id: "dummy-5",
    title: "Retro City Lights",
    date: "2026-05-01",
    time: "22:30",
    accent: "graphite",
    facebookUrl: "https://www.facebook.com/profile.php?id=61575425759586&locale=hu_HU",
  },
];

const mockFacebookFeedItems: FacebookFeedItem[] = [
  {
    id: "event-1",
    eyebrow: "Facebook event",
    title: "Hétvégi nyitó est",
    subtitle: "Kattintás után a valódi Facebook esemény nyílik meg.",
    href: "https://fb.me/e/3lJC1LLFD",
    tone: "lime",
  },
  {
    id: "event-2",
    eyebrow: "Következő buli",
    title: "Soho night session",
    subtitle: "Valódi event linkkel, saját dizájnéppel megjelenítve.",
    href: "https://fb.me/e/8hWvC5sVa",
    tone: "blue",
  },
  {
    id: "post-1",
    eyebrow: "Friss poszt",
    title: "Klubpillanatok",
    subtitle: "Poszt, teaser vagy aftermovie is bekerülhet ugyanebbe a rácsba.",
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

  if (!result.ok || result.source === "mock") {
    return mockHomepageEvents;
  }

  const mapped = result.data
    .filter((row) => isPublished(row.published))
    .sort((a, b) => toSortOrder(a.sort_order, 9999) - toSortOrder(b.sort_order, 9999))
    .map((row, index) => ({
      id: row.id || `event-${index + 1}`,
      title: row.title || "Esemény",
      date: row.date || "",
      time: row.time || "",
      accent: getTone(index),
      facebookUrl: row.facebook_url || "#",
      coverImageUrl: getDriveThumbnailUrl(row.cover_drive_file_id, 1600),
    }));

  return mapped.length > 0 ? mapped : mockHomepageEvents;
}

export async function getFacebookFeedItems() {
  const result = await getCachedFacebookFeedContent();

  if (!result.ok || result.source === "mock") {
    return mockFacebookFeedItems;
  }

  const mapped = result.data
    .filter((row) => isPublished(row.published))
    .sort((a, b) => toSortOrder(a.sort_order, 9999) - toSortOrder(b.sort_order, 9999))
    .map((row, index) => ({
      id: row.id || `feed-${index + 1}`,
      eyebrow: index < 2 ? "Facebook event" : "Friss poszt",
      title: row.title || "Facebook tartalom",
      subtitle: row.text || "Facebook tartalom a Soho felületén.",
      href: row.facebook_url || "#",
      tone: getTone(index),
      coverImageUrl: getDriveThumbnailUrl(row.cover_drive_file_id, 1200),
    }));

  return mapped.length > 0 ? mapped : mockFacebookFeedItems;
}
