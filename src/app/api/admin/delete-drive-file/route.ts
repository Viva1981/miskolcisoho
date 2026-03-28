import { NextRequest, NextResponse } from "next/server";

import { deleteAdminDriveFile } from "@/lib/admin-content";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    fileId?: string;
  };

  const fileId = body.fileId?.trim();

  if (!fileId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing fileId.",
      },
      { status: 400 },
    );
  }

  const result = await deleteAdminDriveFile(fileId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
  });
}
