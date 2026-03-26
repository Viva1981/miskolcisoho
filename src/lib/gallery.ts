import "server-only";

import { getAdminContent } from "@/lib/admin-content";
import { getContentConfig } from "@/lib/content-config";
import { getDriveThumbnailUrl } from "@/lib/content";

export type GalleryImage = {
  id: string;
  name: string;
  alt: string;
  caption?: string;
  tone: string;
  imageUrl?: string;
  fileUrl?: string;
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
  coverImageUrl?: string;
  images: GalleryImage[];
};

const tones = ["lime", "blue", "violet", "sunset", "graphite", "emerald"] as const;

const mockAlbums: Omit<GalleryAlbum, "rootFolderId">[] = [
  {
    id: "album-opening-night",
    slug: "opening-night",
    title: "Opening Night",
    eventDate: "2026.04.24.",
    tags: ["soho", "opening", "miskolc"],
    description:
      "Főkártyaadatokhoz és képlistához előkészített mintaalbum. Később a Google Drive mappából és egy metaadat-listából fog összeállni.",
    coverTone: "lime",
    driveFolderId: "drive-folder-opening-night",
    images: [
      { id: "img-1", name: "opening-01.jpg", alt: "Opening Night 1", tone: "lime" },
      { id: "img-2", name: "opening-02.jpg", alt: "Opening Night 2", tone: "blue" },
      { id: "img-3", name: "opening-03.jpg", alt: "Opening Night 3", tone: "violet" },
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
    ],
  },
];

export function getGalleryRootFolderId() {
  return getContentConfig().driveRootFolderId;
}

export function isGoogleDriveLiveMode() {
  return Boolean(process.env.APPS_SCRIPT_WEB_APP_URL && process.env.ADMIN_SHARED_SECRET);
}

function getTone(index: number) {
  return tones[index % tones.length];
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isPublished(value: string | undefined) {
  return String(value ?? "").trim().toLowerCase() === "true";
}

function toSortOrder(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function getGalleryAlbums() {
  const rootFolderId = getGalleryRootFolderId();
  const [albumsResult, imagesResult] = await Promise.all([
    getAdminContent("gallery_albums"),
    getAdminContent("gallery_images"),
  ]);

  if (!albumsResult.ok || !imagesResult.ok || albumsResult.source === "mock") {
    return mockAlbums.map((album) => ({
      ...album,
      rootFolderId,
    }));
  }

  const publishedAlbums = albumsResult.data
    .filter((row) => isPublished(row.published))
    .sort((a, b) => toSortOrder(a.sort_order, 9999) - toSortOrder(b.sort_order, 9999));

  const publishedImages = imagesResult.data
    .sort((a, b) => toSortOrder(a.sort_order, 9999) - toSortOrder(b.sort_order, 9999));

  const albums = publishedAlbums.map((row, albumIndex) => {
    const albumImages = publishedImages
      .filter((image) => image.album_id === row.id)
      .map((image, imageIndex) => ({
        id: image.id || `${row.id}-image-${imageIndex + 1}`,
        name: image.drive_file_id ? `Kép ${imageIndex + 1}` : `Galéria kép ${imageIndex + 1}`,
        alt: image.caption || row.title || `Galéria kép ${imageIndex + 1}`,
        caption: image.caption || "",
        tone: getTone(imageIndex),
        imageUrl: getDriveThumbnailUrl(image.drive_file_id, 1600),
        fileUrl: image.drive_file_url || "",
      }));

    return {
      id: row.id || `album-${albumIndex + 1}`,
      slug: row.slug || slugify(row.title || `album-${albumIndex + 1}`),
      title: row.title || `Galéria ${albumIndex + 1}`,
      eventDate: row.event_date || "",
      tags: ["soho", "galéria"],
      description: row.description || "Soho galéria album.",
      coverTone: getTone(albumIndex),
      driveFolderId: row.drive_folder_id || "",
      rootFolderId,
      coverImageUrl:
        getDriveThumbnailUrl(row.cover_drive_file_id, 1400) || albumImages[0]?.imageUrl || "",
      images: albumImages,
    } satisfies GalleryAlbum;
  });

  return albums.length > 0
    ? albums
    : mockAlbums.map((album) => ({
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
