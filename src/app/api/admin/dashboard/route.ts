import { NextRequest, NextResponse } from "next/server";

import { ensureAdminApiAuth } from "@/lib/admin-auth";
import { getAdminContent, getAdminDriveStorage } from "@/lib/admin-content";

export async function GET(request: NextRequest) {
  const authResponse = ensureAdminApiAuth(request);
  if (authResponse) {
    return authResponse;
  }

  const [events, facebookFeed, galleryAlbums, driveStorage] = await Promise.all([
    getAdminContent("events"),
    getAdminContent("facebook_feed"),
    getAdminContent("gallery_albums"),
    getAdminDriveStorage(),
  ]);

  return NextResponse.json({
    ok: events.ok && facebookFeed.ok && galleryAlbums.ok && driveStorage.ok,
    resources: {
      events,
      facebookFeed,
      galleryAlbums,
      driveStorage,
    },
  });
}
