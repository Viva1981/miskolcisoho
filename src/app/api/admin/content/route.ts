import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { ensureAdminApiAuth } from "@/lib/admin-auth";
import {
  createAdminRow,
  deleteAdminDriveFile,
  deleteAdminDriveFolder,
  deleteAdminRow,
  getAdminContent,
  parseAdminResource,
  updateAdminRow,
} from "@/lib/admin-content";

export async function GET(request: NextRequest) {
  const authResponse = ensureAdminApiAuth(request);
  if (authResponse) {
    return authResponse;
  }

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
  const authResponse = ensureAdminApiAuth(request);
  if (authResponse) {
    return authResponse;
  }

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
            date_end: body.payload.date_end?.trim() ?? "",
            time: body.payload.time?.trim() ?? "",
            time_end: body.payload.time_end?.trim() ?? "",
            facebook_url: body.payload.facebook_url?.trim() ?? "",
            drive_folder_id: body.payload.drive_folder_id?.trim() ?? "",
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
                text: "",
                facebook_url: body.payload.facebook_url?.trim() ?? "",
                drive_folder_id: body.payload.drive_folder_id?.trim() ?? "",
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

    revalidatePublicContent(resource);

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
  const authResponse = ensureAdminApiAuth(request);
  if (authResponse) {
    return authResponse;
  }

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

  const cleanup = await deleteResourceAssets(resource, body.id.trim());

  if (!cleanup.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: cleanup.error,
      },
      { status: 502 },
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

  revalidatePublicContent(resource);

  return NextResponse.json({
    ok: true,
    source: response.source,
    data: response.data,
  });
}

export async function PUT(request: NextRequest) {
  const authResponse = ensureAdminApiAuth(request);
  if (authResponse) {
    return authResponse;
  }

  const body = (await request.json()) as {
    resource?: string;
    id?: string;
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

  if (!body.id?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing row id.",
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

  const response = await updateAdminRow(resource, body.id.trim(), body.payload);

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

  revalidatePublicContent(resource);

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

function revalidatePublicContent(
  resource: "events" | "facebook_feed" | "gallery_albums" | "gallery_images",
) {
  if (resource === "events") {
    revalidateTag("public-events-content", "max");
    revalidatePath("/");
    return;
  }

  if (resource === "facebook_feed") {
    revalidateTag("public-facebook-feed-content", "max");
    revalidatePath("/");
    return;
  }

  if (resource === "gallery_albums") {
    revalidateTag("public-gallery-albums-content", "max");
    revalidatePath("/galeria");
    return;
  }

  revalidateTag("public-gallery-images-content", "max");
  revalidatePath("/galeria");
}

async function deleteResourceAssets(
  resource: "events" | "facebook_feed" | "gallery_albums" | "gallery_images",
  id: string,
) {
  const currentRows = await getAdminContent(resource);

  if (!currentRows.ok) {
    return {
      ok: false as const,
      error: currentRows.error ?? "Nem sikerült lekérni a törlendő elemet.",
    };
  }

  const row = currentRows.data.find((entry) => entry.id === id);

  if (!row) {
    return {
      ok: false as const,
      error: "A törlendő elem nem található.",
    };
  }

  if (resource === "gallery_images") {
    if (row.drive_file_id) {
      const deleteResult = await deleteAdminDriveFile(row.drive_file_id);

      if (!deleteResult.ok) {
        return {
          ok: false as const,
          error: deleteResult.error,
        };
      }
    }

    return { ok: true as const };
  }

  if (resource === "gallery_albums") {
    if (row.drive_folder_id) {
      const deleteFolderResult = await deleteAdminDriveFolder(row.drive_folder_id);

      if (!deleteFolderResult.ok) {
        return {
          ok: false as const,
          error: deleteFolderResult.error,
        };
      }
    } else if (row.cover_drive_file_id) {
      const deleteCoverResult = await deleteAdminDriveFile(row.cover_drive_file_id, {
        deleteParentFolder: true,
      });

      if (!deleteCoverResult.ok) {
        return {
          ok: false as const,
          error: deleteCoverResult.error,
        };
      }
    }

    const galleryImages = await getAdminContent("gallery_images");

    if (!galleryImages.ok) {
      return {
        ok: false as const,
        error: galleryImages.error ?? "Nem sikerült lekérni a galéria képeit.",
      };
    }

    const linkedImages = galleryImages.data.filter((image) => image.album_id === id);

    for (const image of linkedImages) {
      const deleteRowResult = await deleteAdminRow("gallery_images", image.id);

      if (!deleteRowResult.ok) {
        return {
          ok: false as const,
          error: deleteRowResult.error ?? "Nem sikerült törölni a kapcsolódó galéria képeket.",
        };
      }
    }

    return { ok: true as const };
  }

  if (row.drive_folder_id) {
    const deleteFolderResult = await deleteAdminDriveFolder(row.drive_folder_id);

    if (!deleteFolderResult.ok) {
      return {
        ok: false as const,
        error: deleteFolderResult.error,
      };
    }

    return { ok: true as const };
  }

  if (row.cover_drive_file_id) {
    const deleteCoverResult = await deleteAdminDriveFile(row.cover_drive_file_id, {
      deleteParentFolder: true,
    });

    if (!deleteCoverResult.ok) {
      return {
        ok: false as const,
        error: deleteCoverResult.error,
      };
    }
  }

  return { ok: true as const };
}
