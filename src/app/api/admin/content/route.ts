import { NextRequest, NextResponse } from "next/server";

import {
  createAdminRow,
  deleteAdminRow,
  getAdminContent,
  parseAdminResource,
} from "@/lib/admin-content";

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
    source: response.source,
    data: response.data ?? [],
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    resource?: string;
    payload?: Record<string, string>;
  };

  const resource = parseAdminResource(body.resource ?? null);

  if (!resource) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid resource.",
      },
      { status: 400 },
    );
  }

  if (!body.payload) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing payload.",
      },
      { status: 400 },
    );
  }

  if (
    resource === "events" ||
    resource === "facebook_feed" ||
    resource === "gallery_albums" ||
    resource === "gallery_images"
  ) {
    const idPrefix =
      resource === "events"
        ? "evt"
        : resource === "facebook_feed"
          ? "feed"
          : resource === "gallery_albums"
            ? "album"
            : "image";
    const response = await createAdminRow(resource, {
      ...(resource === "events"
        ? {
            id: `${idPrefix}_${Date.now()}`,
            title: body.payload.title?.trim() ?? "",
            date: body.payload.date?.trim() ?? "",
            time: body.payload.time?.trim() ?? "",
            facebook_url: body.payload.facebook_url?.trim() ?? "",
            cover_drive_file_id: body.payload.cover_drive_file_id?.trim() ?? "",
            cover_drive_url: body.payload.cover_drive_url?.trim() ?? "",
            published: body.payload.published?.trim() ?? "true",
            sort_order: body.payload.sort_order?.trim() ?? "10",
          }
          : resource === "gallery_albums"
            ? {
                id: `${idPrefix}_${Date.now()}`,
                slug:
                  body.payload.slug?.trim() ||
                  slugify(body.payload.title?.trim() ?? `${idPrefix}_${Date.now()}`),
                title: body.payload.title?.trim() ?? "",
                event_date: body.payload.event_date?.trim() ?? "",
                description: body.payload.description?.trim() ?? "",
                drive_folder_id: body.payload.drive_folder_id?.trim() ?? "",
                cover_drive_file_id: body.payload.cover_drive_file_id?.trim() ?? "",
                cover_drive_url: body.payload.cover_drive_url?.trim() ?? "",
                published: body.payload.published?.trim() ?? "true",
                sort_order: body.payload.sort_order?.trim() ?? "10",
              }
            : resource === "gallery_images"
              ? {
                  id: `${idPrefix}_${Date.now()}`,
                  album_id: body.payload.album_id?.trim() ?? "",
                  drive_file_id: body.payload.drive_file_id?.trim() ?? "",
                  drive_file_url: body.payload.drive_file_url?.trim() ?? "",
                  caption: body.payload.caption?.trim() ?? "",
                  sort_order: body.payload.sort_order?.trim() ?? "10",
                }
              : {
                  id: `${idPrefix}_${Date.now()}`,
                  title: body.payload.title?.trim() ?? "",
                  text: body.payload.text?.trim() ?? "",
                  facebook_url: body.payload.facebook_url?.trim() ?? "",
                  cover_drive_file_id: body.payload.cover_drive_file_id?.trim() ?? "",
                  cover_drive_url: body.payload.cover_drive_url?.trim() ?? "",
                  published: body.payload.published?.trim() ?? "true",
                  sort_order: body.payload.sort_order?.trim() ?? "10",
                }),
    });

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
      source: response.source,
      data: response.data,
    });
  }

  return NextResponse.json(
    {
      ok: false,
      error: "This resource is not writable yet.",
    },
    { status: 400 },
  );
}

export async function DELETE(request: NextRequest) {
  const body = (await request.json()) as {
    resource?: string;
    id?: string;
  };

  const resource = parseAdminResource(body.resource ?? null);

  if (!resource) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid resource.",
      },
      { status: 400 },
    );
  }

  if (!body.id?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing row id.",
      },
      { status: 400 },
    );
  }

  const response = await deleteAdminRow(resource, body.id.trim());

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
    source: response.source,
    data: response.data,
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
