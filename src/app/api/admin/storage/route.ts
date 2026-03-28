import { NextResponse } from "next/server";

import { getAdminDriveStorage } from "@/lib/admin-content";

export async function GET() {
  const result = await getAdminDriveStorage();

  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
  });
}
