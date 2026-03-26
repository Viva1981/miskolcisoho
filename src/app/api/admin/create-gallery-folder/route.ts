import { NextRequest, NextResponse } from "next/server";

import { createAdminDriveFolder } from "@/lib/admin-content";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    folderName?: string;
  };

  if (!body.folderName?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing folder name.",
      },
      { status: 400 },
    );
  }

  const response = await createAdminDriveFolder({
    collectionName: "gallery",
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
