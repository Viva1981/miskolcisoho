import { NextRequest, NextResponse } from "next/server";

import { getMockAdminRows, isAdminResource } from "@/lib/admin-resources";
import { callAppsScript, isAppsScriptConfigured } from "@/lib/apps-script";

export async function GET(request: NextRequest) {
  const resource = request.nextUrl.searchParams.get("resource");

  if (!resource || !isAdminResource(resource)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid resource.",
      },
      { status: 400 },
    );
  }

  if (!isAppsScriptConfigured()) {
    const data = await getMockAdminRows(resource);
    return NextResponse.json({
      ok: true,
      source: "mock",
      data,
    });
  }

  const response = await callAppsScript({
    action: "GET_CONTENT",
    resource,
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
    source: "apps-script",
    data: response.data ?? [],
  });
}
