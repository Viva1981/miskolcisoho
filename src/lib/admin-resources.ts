import { getFacebookFeedItems, getHomepageEvents } from "@/lib/content";
import { getGalleryAlbums } from "@/lib/gallery";

export const adminResources = [
  "events",
  "facebook_feed",
  "gallery_albums",
  "gallery_images",
] as const;

export type AdminResource = (typeof adminResources)[number];

export type AdminRow = Record<string, string>;

export function isAdminResource(value: string): value is AdminResource {
  return adminResources.includes(value as AdminResource);
}

export async function getMockAdminRows(resource: AdminResource): Promise<AdminRow[]> {
  switch (resource) {
    case "events": {
      const events = await getHomepageEvents();
      return events.map((event, index) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        facebook_url: event.facebookUrl,
        cover_drive_file_id: "",
        cover_drive_url: "",
        published: "true",
        sort_order: String((index + 1) * 10),
      }));
    }
    case "facebook_feed": {
      const items = await getFacebookFeedItems();
      return items.map((item, index) => ({
        id: item.id,
        title: item.title,
        text: item.subtitle,
        facebook_url: item.href,
        cover_drive_file_id: "",
        cover_drive_url: "",
        published: "true",
        sort_order: String((index + 1) * 10),
      }));
    }
    case "gallery_albums": {
      const albums = await getGalleryAlbums();
      return albums.map((album, index) => ({
        id: album.id,
        slug: album.slug,
        title: album.title,
        event_date: album.eventDate,
        description: album.description,
        drive_folder_id: album.driveFolderId,
        cover_drive_file_id: "",
        cover_drive_url: "",
        published: "true",
        sort_order: String((index + 1) * 10),
      }));
    }
    case "gallery_images": {
      const albums = await getGalleryAlbums();
      return albums.flatMap((album) =>
        album.images.map((image, index) => ({
          id: `${album.id}_${image.id}`,
          album_id: album.id,
          drive_file_id: "",
          drive_file_url: "",
          caption: image.caption ?? image.alt,
          sort_order: String((index + 1) * 10),
        })),
      );
    }
  }
}
