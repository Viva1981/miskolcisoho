import { NextRequest, NextResponse } from "next/server";

import { ensureAdminApiAuth } from "@/lib/admin-auth";
import { replaceAdminDriveFile } from "@/lib/admin-content";

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const authResponse = ensureAdminApiAuth(request);
  if (authResponse) {
    return authResponse;
  }

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

  if (!mimeType.startsWith("image/")) {
    return NextResponse.json(
      {
        ok: false,
        error: "Csak képfájl tölthető fel.",
      },
      { status: 400 },
    );
  }

  const estimatedBytes = Math.floor((base64.length * 3) / 4);

  if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: "A kiválasztott kép túl nagy. A maximális méret 4 MB.",
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
