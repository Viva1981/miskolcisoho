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
};

export type FacebookFeedItem = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
  tone: AccentTone;
};

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
] as const;

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
    subtitle: "Valódi event linkkel, saját dizájnképpel megjelenítve.",
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
  {
    id: "post-2",
    eyebrow: "Fotóalbum",
    title: "Pénteki hangulat",
    subtitle: "Később saját feltöltött 1:1 vagy 4:5 arányú borítóképpel.",
    href: "https://www.facebook.com/profile.php?id=61575425759586&locale=hu_HU",
    tone: "sunset",
  },
  {
    id: "post-3",
    eyebrow: "Kiemelt poszt",
    title: "Line-up bejelentés",
    subtitle: "A feed egységes marad, nem esik szét iframe-ek miatt.",
    href: "https://www.facebook.com/profile.php?id=61575425759586&locale=hu_HU",
    tone: "graphite",
  },
  {
    id: "post-4",
    eyebrow: "Kulisszák mögött",
    title: "Backstage vibe",
    subtitle: "Ez a blokk ideális lesz adminos vagy Drive-os adatforráshoz is.",
    href: "https://www.facebook.com/profile.php?id=61575425759586&locale=hu_HU",
    tone: "emerald",
  },
] as const;

export async function getHomepageEvents() {
  return mockHomepageEvents;
}

export async function getFacebookFeedItems() {
  return mockFacebookFeedItems;
}
