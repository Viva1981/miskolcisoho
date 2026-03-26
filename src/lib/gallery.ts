export type GalleryImage = {
  id: string;
  name: string;
  alt: string;
  caption?: string;
  tone: string;
};

export type GalleryAlbum = {
  id: string;
  slug: string;
  title: string;
  eventDate: string;
  tags: string[];
  description: string;
  coverTone: string;
  driveFolderId: string;
  rootFolderId: string;
  images: GalleryImage[];
};

import { getContentConfig } from "@/lib/content-config";

export function getGalleryRootFolderId() {
  return getContentConfig().driveRootFolderId;
}

export function isGoogleDriveLiveMode() {
  return Boolean(process.env.GOOGLE_DRIVE_API_KEY);
}

const mockAlbums: Omit<GalleryAlbum, "rootFolderId">[] = [
  {
    id: "album-opening-night",
    slug: "opening-night",
    title: "Opening Night",
    eventDate: "2026.04.24.",
    tags: ["soho", "opening", "miskolc"],
    description:
      "Főkártya-adatokhoz és képlistához előkészített mintaalbum. Később a Google Drive mappából és egy metaadat-listából fog összeállni.",
    coverTone: "lime",
    driveFolderId: "drive-folder-opening-night",
    images: [
      { id: "img-1", name: "opening-01.jpg", alt: "Opening Night 1", tone: "lime" },
      { id: "img-2", name: "opening-02.jpg", alt: "Opening Night 2", tone: "blue" },
      { id: "img-3", name: "opening-03.jpg", alt: "Opening Night 3", tone: "violet" },
      { id: "img-4", name: "opening-04.jpg", alt: "Opening Night 4", tone: "sunset" },
      { id: "img-5", name: "opening-05.jpg", alt: "Opening Night 5", tone: "emerald" },
      { id: "img-6", name: "opening-06.jpg", alt: "Opening Night 6", tone: "graphite" },
    ],
  },
  {
    id: "album-city-lights",
    slug: "city-lights-session",
    title: "City Lights Session",
    eventDate: "2026.05.01.",
    tags: ["citylights", "party", "soho"],
    description:
      "A listaoldal Rockwell-szerű kártyákat mutat, az albumoldal pedig külön képrácsot. Ez a második mintaalbum már a későbbi paginált galériaszerkezetet készíti elő.",
    coverTone: "blue",
    driveFolderId: "drive-folder-city-lights",
    images: [
      { id: "img-1", name: "city-01.jpg", alt: "City Lights 1", tone: "blue" },
      { id: "img-2", name: "city-02.jpg", alt: "City Lights 2", tone: "graphite" },
      { id: "img-3", name: "city-03.jpg", alt: "City Lights 3", tone: "emerald" },
      { id: "img-4", name: "city-04.jpg", alt: "City Lights 4", tone: "sunset" },
      { id: "img-5", name: "city-05.jpg", alt: "City Lights 5", tone: "violet" },
      { id: "img-6", name: "city-06.jpg", alt: "City Lights 6", tone: "lime" },
    ],
  },
  {
    id: "album-live-session",
    slug: "live-session",
    title: "Live Session",
    eventDate: "2026.05.15.",
    tags: ["live", "concert", "soho"],
    description:
      "A teljes adatút úgy készül, hogy a főkártya metaadatai és a képek külön is jöhessenek Google Drive-ból vagy később adminfelületről.",
    coverTone: "violet",
    driveFolderId: "drive-folder-live-session",
    images: [
      { id: "img-1", name: "live-01.jpg", alt: "Live Session 1", tone: "violet" },
      { id: "img-2", name: "live-02.jpg", alt: "Live Session 2", tone: "sunset" },
      { id: "img-3", name: "live-03.jpg", alt: "Live Session 3", tone: "lime" },
      { id: "img-4", name: "live-04.jpg", alt: "Live Session 4", tone: "graphite" },
      { id: "img-5", name: "live-05.jpg", alt: "Live Session 5", tone: "blue" },
      { id: "img-6", name: "live-06.jpg", alt: "Live Session 6", tone: "emerald" },
    ],
  },
];

export async function getGalleryAlbums() {
  const rootFolderId = getGalleryRootFolderId();

  return mockAlbums.map((album) => ({
    ...album,
    rootFolderId,
  }));
}

export async function getGalleryAlbum(slug: string) {
  const albums = await getGalleryAlbums();
  return albums.find((album) => album.slug === slug) ?? null;
}

export async function getGallerySlugs() {
  const albums = await getGalleryAlbums();
  return albums.map((album) => ({ slug: album.slug }));
}
