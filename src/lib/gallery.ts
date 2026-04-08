import "server-only";

import { unstable_cache } from "next/cache";

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
  lightboxImageUrl?: string;
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
const PUBLIC_GALLERY_REVALIDATE_SECONDS = 300;
const GALLERY_COVER_THUMBNAIL_WIDTH = 960;
const GALLERY_GRID_THUMBNAIL_WIDTH = 960;
const GALLERY_LIGHTBOX_WIDTH = 1800;

const mockAlbums: Omit<GalleryAlbum, "rootFolderId">[] = [
  {
    id: "album-opening-night",
    slug: "opening-night",
    title: "Opening Night",
    eventDate: "2026.04.24.",
    tags: ["soho", "opening", "miskolc"],
    description:
      "Fokartyaadatokhoz es keplistahoz elokeszitett mintaalbum. Kesobb a Google Drive mappabol es egy metadata-listabol fog osszeallni.",
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
      "A listaoldal Rockwell-szeru kartyakat mutat, az albumoldal pedig kulon kepracsot. Ez a masodik mintaalbum mar a kesobbi paginalt galeria-szerkezetet kesziti elo.",
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
      "A teljes adatut ugy keszul, hogy a fokartya metadatai es a kepek kulon is johessenek Google Drive-bol vagy kesobb adminfeluletrol.",
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

function buildAlbumTags(title: string) {
  const words = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length >= 3)
    .slice(0, 2);

  return Array.from(new Set([...words, "miskolc", "soho"]));
}

function isPublished(value: string | undefined) {
  return String(value ?? "").trim().toLowerCase() === "true";
}

function toSortOrder(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const getCachedGalleryAlbumsContent = unstable_cache(
  async () => getAdminContent("gallery_albums"),
  ["public-gallery-albums-content"],
  {
    revalidate: PUBLIC_GALLERY_REVALIDATE_SECONDS,
    tags: ["public-gallery-albums-content"],
  },
);

const getCachedGalleryImagesContent = unstable_cache(
  async () => getAdminContent("gallery_images"),
  ["public-gallery-images-content"],
  {
    revalidate: PUBLIC_GALLERY_REVALIDATE_SECONDS,
    tags: ["public-gallery-images-content"],
  },
);

export async function getGalleryAlbums() {
  const rootFolderId = getGalleryRootFolderId();
  const [albumsResult, imagesResult] = await Promise.all([
    getCachedGalleryAlbumsContent(),
    getCachedGalleryImagesContent(),
  ]);

  if (
    process.env.NODE_ENV !== "production" &&
    (!albumsResult.ok || !imagesResult.ok || albumsResult.source === "mock")
  ) {
    return mockAlbums.map((album) => ({
      ...album,
      rootFolderId,
    }));
  }

  if (!albumsResult.ok || !imagesResult.ok || albumsResult.source === "mock") {
    return [];
  }

  const publishedAlbums = albumsResult.data
    .filter((row) => isPublished(row.published))
    .sort((a, b) => toSortOrder(a.sort_order, 9999) - toSortOrder(b.sort_order, 9999));

  const publishedImages = imagesResult.data.sort(
    (a, b) => toSortOrder(a.sort_order, 9999) - toSortOrder(b.sort_order, 9999),
  );

  const albums = publishedAlbums.map((row, albumIndex) => {
    const albumImages = publishedImages
      .filter((image) => image.album_id === row.id)
      .map((image, imageIndex) => ({
        id: image.id || `${row.id}-image-${imageIndex + 1}`,
        name: image.drive_file_id ? `Kep ${imageIndex + 1}` : `Galeria kep ${imageIndex + 1}`,
        alt: image.caption || row.title || `Galeria kep ${imageIndex + 1}`,
        caption: image.caption || "",
        tone: getTone(imageIndex),
        imageUrl: getDriveThumbnailUrl(image.drive_file_id, GALLERY_GRID_THUMBNAIL_WIDTH),
        lightboxImageUrl: getDriveThumbnailUrl(image.drive_file_id, GALLERY_LIGHTBOX_WIDTH),
        fileUrl: image.drive_file_url || "",
      }));

    return {
      id: row.id || `album-${albumIndex + 1}`,
      slug: row.slug || slugify(row.title || `album-${albumIndex + 1}`),
      title: row.title || `Galeria ${albumIndex + 1}`,
      eventDate: row.event_date || "",
      tags: buildAlbumTags(row.title || `album-${albumIndex + 1}`),
      description: row.description || "Soho galeria album.",
      coverTone: getTone(albumIndex),
      driveFolderId: row.drive_folder_id || "",
      rootFolderId,
      coverImageUrl:
        getDriveThumbnailUrl(row.cover_drive_file_id, GALLERY_COVER_THUMBNAIL_WIDTH) ||
        albumImages[0]?.imageUrl ||
        "",
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
