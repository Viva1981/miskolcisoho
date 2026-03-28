import { NextRequest, NextResponse } from "next/server";

import { ensureAdminApiAuth } from "@/lib/admin-auth";
import { createAdminDriveFolder } from "@/lib/admin-content";

const ALLOWED_COLLECTIONS = new Set(["events", "facebook_feed", "gallery"]);

export async function POST(request: NextRequest) {
  const authResponse = ensureAdminApiAuth(request);
  if (authResponse) {
    return authResponse;
  }

  const body = (await request.json()) as {
    collectionName?: string;
    folderName?: string;
  };

  if (!body.collectionName?.trim() || !body.folderName?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing folder creation fields.",
      },
      { status: 400 },
    );
  }

  if (!ALLOWED_COLLECTIONS.has(body.collectionName.trim())) {
    return NextResponse.json(
      {
        ok: false,
        error: "Ismeretlen gyűjtőmappa.",
      },
      { status: 400 },
    );
  }

  const response = await createAdminDriveFolder({
    collectionName: body.collectionName.trim(),
    folderName: body.folderName.trim(),
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: response.error,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    folderId: response.folderId,
    folderUrl: response.folderUrl,
    folderName: response.folderName,
  });
}
