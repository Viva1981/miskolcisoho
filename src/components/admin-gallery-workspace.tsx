"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminGalleryAlbumForm } from "@/components/admin-gallery-album-form";
import { AdminGalleryImageForm } from "@/components/admin-gallery-image-form";
import { AdminPreviewTable } from "@/components/admin-preview-table";

type AdminGalleryWorkspaceProps = {
  albumsResult: {
    source: "mock" | "apps-script";
    ok: boolean;
    error?: string;
    rows: Record<string, string>[];
  };
  onAlbumsChange?: () => Promise<void> | void;
  loading?: boolean;
};

export function AdminGalleryWorkspace({
  albumsResult,
  onAlbumsChange,
  loading = false,
}: AdminGalleryWorkspaceProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState(albumsResult.rows[0]?.id ?? "");
  const [galleryImagesResult, setGalleryImagesResult] = useState<{
    ok: boolean;
    source: "mock" | "apps-script";
    rows: Record<string, string>[];
    error?: string;
    loading: boolean;
  }>({
    ok: true,
    source: "apps-script",
    rows: [],
    loading: true,
  });

  const albumOptions = useMemo(
    () =>
      albumsResult.rows.map((album) => ({
        id: album.id ?? "",
        title: album.title ?? album.slug ?? album.id ?? "Névtelen album",
        driveFolderId: album.drive_folder_id ?? "",
      })),
    [albumsResult.rows],
  );

  const selectedAlbum = useMemo(
    () => albumOptions.find((album) => album.id === selectedAlbumId) ?? albumOptions[0] ?? null,
    [albumOptions, selectedAlbumId],
  );

  const activeAlbumId = selectedAlbum?.id ?? "";

  const loadImages = useCallback(async () => {
    setGalleryImagesResult((current) => ({
      ...current,
      loading: true,
      error: "",
    }));

    try {
      const response = await fetch("/api/admin/content?resource=gallery_images", {
        cache: "no-store",
      });

      const result = (await response.json()) as {
        ok: boolean;
        source: "mock" | "apps-script";
        data?: Record<string, string>[];
        error?: string;
      };

      setGalleryImagesResult({
        ok: result.ok,
        source: result.source,
        rows: result.data ?? [],
        error: result.error,
        loading: false,
      });
    } catch (error) {
      setGalleryImagesResult({
        ok: false,
        source: "apps-script",
        rows: [],
        error: error instanceof Error ? error.message : "Ismeretlen hiba történt.",
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initialLoad() {
      try {
        const response = await fetch("/api/admin/content?resource=gallery_images", {
          cache: "no-store",
        });

        const result = (await response.json()) as {
          ok: boolean;
          source: "mock" | "apps-script";
          data?: Record<string, string>[];
          error?: string;
        };

        if (!active) {
          return;
        }

        setGalleryImagesResult({
          ok: result.ok,
          source: result.source,
          rows: result.data ?? [],
          error: result.error,
          loading: false,
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setGalleryImagesResult({
          ok: false,
          source: "apps-script",
          rows: [],
          error: error instanceof Error ? error.message : "Ismeretlen hiba történt.",
          loading: false,
        });
      }
    }

    void initialLoad();

    return () => {
      active = false;
    };
  }, []);

  const filteredImageRows = useMemo(() => {
    if (!activeAlbumId) {
      return galleryImagesResult.rows;
    }

    return galleryImagesResult.rows.filter((row) => row.album_id === activeAlbumId);
  }, [activeAlbumId, galleryImagesResult.rows]);

  return (
    <>
      <div className="soho-admin-grid">
        <AdminGalleryAlbumForm onSuccess={onAlbumsChange} />

        <AdminPreviewTable
          title="Galéria albumok"
          resource="gallery_albums"
          source={albumsResult.source}
          ok={albumsResult.ok}
          error={albumsResult.error}
          rows={albumsResult.rows}
          columns={["id", "slug", "title", "event_date", "drive_folder_id", "published", "sort_order"]}
          editableFields={[
            "slug",
            "title",
            "event_date",
            "description",
            "drive_folder_id",
            "cover_drive_file_id",
            "cover_drive_url",
            "published",
            "sort_order",
          ]}
          onChange={onAlbumsChange}
          loading={loading}
        />
      </div>

      <article className="soho-admin-card soho-admin-album-picker">
        <div className="soho-admin-preview-head">
          <div>
            <h2>Galériák kezelése</h2>
            <p>
              Válassz ki egy galériát, és az alatta lévő blokkok már csak ahhoz az albumhoz
              igazodnak.
            </p>
          </div>
        </div>

        <div className="soho-admin-album-strip">
          {albumOptions.map((album) => (
            <button
              key={album.id}
              type="button"
              className={`soho-admin-album-chip ${activeAlbumId === album.id ? "is-active" : ""}`}
              onClick={() => setSelectedAlbumId(album.id)}
            >
              {album.title}
            </button>
          ))}
        </div>
      </article>

      <div className="soho-admin-grid">
        <AdminGalleryImageForm
          albumOptions={albumOptions}
          selectedAlbumId={activeAlbumId}
          onAlbumChange={setSelectedAlbumId}
          onSuccess={loadImages}
        />

        <AdminPreviewTable
          title={selectedAlbum ? `Képek: ${selectedAlbum.title}` : "Galéria képek"}
          resource="gallery_images"
          source={galleryImagesResult.source}
          ok={galleryImagesResult.ok}
          error={galleryImagesResult.loading ? "Képek betöltése..." : galleryImagesResult.error}
          rows={filteredImageRows}
          columns={["id", "album_id", "drive_file_id", "drive_file_url", "caption", "sort_order"]}
          editableFields={["album_id", "drive_file_id", "drive_file_url", "sort_order"]}
          onChange={loadImages}
        />
      </div>
    </>
  );
}
