import { NextRequest, NextResponse } from "next/server";

import { replaceAdminDriveFile } from "@/lib/admin-content";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    oldFileId?: string;
    fileName?: string;
    mimeType?: string;
    base64?: string;
  };

  const oldFileId = body.oldFileId?.trim();
  const fileName = body.fileName?.trim();
  const mimeType = body.mimeType?.trim();
  const base64 = body.base64?.trim();

  if (!oldFileId || !fileName || !mimeType || !base64) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing replace payload fields.",
      },
      { status: 400 },
    );
  }

  const result = await replaceAdminDriveFile({
    oldFileId,
    fileName,
    mimeType,
    base64,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
  });
}
