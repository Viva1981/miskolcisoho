import { NextRequest, NextResponse } from "next/server";

import { ensureAdminApiAuth } from "@/lib/admin-auth";
import { uploadAdminDriveFile } from "@/lib/admin-content";

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const authResponse = ensureAdminApiAuth(request);
  if (authResponse) {
    return authResponse;
  }

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

  if (!body.mimeType.trim().startsWith("image/")) {
    return NextResponse.json(
      {
        ok: false,
        error: "Csak képfájl tölthető fel.",
      },
      { status: 400 },
    );
  }

  const estimatedBytes = Math.floor((body.base64.trim().length * 3) / 4);

  if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: "A kiválasztott kép túl nagy. A maximális méret 4 MB.",
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
