import { NextRequest, NextResponse } from "next/server";

import { getAdminContent, parseAdminResource } from "@/lib/admin-content";

export async function GET(request: NextRequest) {
  const resource = parseAdminResource(request.nextUrl.searchParams.get("resource"));

  if (!resource) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid resource.",
      },
      { status: 400 },
    );
  }

  const response = await getAdminContent(resource);

  if (!response.ok) {
    return NextResponse.json(
      {
        ok: false,
        source: response.source,
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
