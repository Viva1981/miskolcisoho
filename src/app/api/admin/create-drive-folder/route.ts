import { NextRequest, NextResponse } from "next/server";

import { createAdminDriveFolder } from "@/lib/admin-content";

export async function POST(request: NextRequest) {
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
