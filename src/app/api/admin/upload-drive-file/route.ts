import { NextRequest, NextResponse } from "next/server";

import { uploadAdminDriveFile } from "@/lib/admin-content";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    folderId?: string;
    fileName?: string;
    mimeType?: string;
    base64?: string;
  };

  if (!body.folderId || !body.fileName || !body.mimeType || !body.base64) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing upload payload fields.",
      },
      { status: 400 },
    );
  }

  const response = await uploadAdminDriveFile({
    folderId: body.folderId.trim(),
    fileName: body.fileName.trim(),
    mimeType: body.mimeType.trim(),
    base64: body.base64.trim(),
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
    fileId: response.fileId,
    fileUrl: response.fileUrl,
  });
}
