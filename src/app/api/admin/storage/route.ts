import { NextRequest, NextResponse } from "next/server";

import { ensureAdminApiAuth } from "@/lib/admin-auth";
import { getAdminDriveStorage } from "@/lib/admin-content";

export async function GET(request: NextRequest) {
  const authResponse = ensureAdminApiAuth(request);
  if (authResponse) {
    return authResponse;
  }

  const result = await getAdminDriveStorage();

  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
  });
}
