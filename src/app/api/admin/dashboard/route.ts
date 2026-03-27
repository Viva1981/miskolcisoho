import { NextResponse } from "next/server";

import { getAdminContent } from "@/lib/admin-content";

export async function GET() {
  const [events, facebookFeed, galleryAlbums] = await Promise.all([
    getAdminContent("events"),
    getAdminContent("facebook_feed"),
    getAdminContent("gallery_albums"),
  ]);

  return NextResponse.json({
    ok: events.ok && facebookFeed.ok && galleryAlbums.ok,
    resources: {
      events,
      facebookFeed,
      galleryAlbums,
    },
  });
}
