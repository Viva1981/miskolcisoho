"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminEventForm } from "@/components/admin-event-form";
import { AdminFacebookFeedForm } from "@/components/admin-facebook-feed-form";
import { AdminGalleryWorkspace } from "@/components/admin-gallery-workspace";
import { AdminPreviewTable } from "@/components/admin-preview-table";

type ResourceResult = {
  ok: boolean;
  source: "mock" | "apps-script";
  data: Record<string, string>[];
  error?: string;
};

type DashboardState = {
  loading: boolean;
  events: ResourceResult;
  facebookFeed: ResourceResult;
  galleryAlbums: ResourceResult;
};

const LOADING_RESULT: ResourceResult = {
  ok: true,
  source: "apps-script",
  data: [],
};

export function AdminDashboard() {
  const [state, setState] = useState<DashboardState>({
    loading: true,
    events: LOADING_RESULT,
    facebookFeed: LOADING_RESULT,
    galleryAlbums: LOADING_RESULT,
  });

  const applyDashboardResponse = useCallback(
    (result: {
      ok: boolean;
      resources?: {
        events?: ResourceResult;
        facebookFeed?: ResourceResult;
        galleryAlbums?: ResourceResult;
      };
    }) => {
      setState({
        loading: false,
        events: result.resources?.events ?? {
          ok: false,
          source: "apps-script",
          data: [],
          error: "Nem sikerült betölteni az eseményeket.",
        },
        facebookFeed: result.resources?.facebookFeed ?? {
          ok: false,
          source: "apps-script",
          data: [],
          error: "Nem sikerült betölteni a Facebook elemeket.",
        },
        galleryAlbums: result.resources?.galleryAlbums ?? {
          ok: false,
          source: "apps-script",
          data: [],
          error: "Nem sikerült betölteni a galéria albumokat.",
        },
      });
    },
    [],
  );

  const applyDashboardError = useCallback((message: string) => {
    setState({
      loading: false,
      events: {
        ok: false,
        source: "apps-script",
        data: [],
        error: message,
      },
      facebookFeed: {
        ok: false,
        source: "apps-script",
        data: [],
        error: message,
      },
      galleryAlbums: {
        ok: false,
        source: "apps-script",
        data: [],
        error: message,
      },
    });
  }, []);

  const loadDashboard = useCallback(async () => {
    setState((current) => ({ ...current, loading: true }));

    try {
      const response = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });

      const result = (await response.json()) as {
        ok: boolean;
        resources?: {
          events?: ResourceResult;
          facebookFeed?: ResourceResult;
          galleryAlbums?: ResourceResult;
        };
      };

      applyDashboardResponse(result);
    } catch (error) {
      applyDashboardError(error instanceof Error ? error.message : "Ismeretlen hiba történt.");
    }
  }, [applyDashboardError, applyDashboardResponse]);

  useEffect(() => {
    let active = true;

    async function loadInitialDashboard() {
      try {
        const response = await fetch("/api/admin/dashboard", {
          cache: "no-store",
        });

        const result = (await response.json()) as {
          ok: boolean;
          resources?: {
            events?: ResourceResult;
            facebookFeed?: ResourceResult;
            galleryAlbums?: ResourceResult;
          };
        };

        if (!active) {
          return;
        }

        applyDashboardResponse(result);
      } catch (error) {
        if (!active) {
          return;
        }

        applyDashboardError(error instanceof Error ? error.message : "Ismeretlen hiba történt.");
      }
    }

    void loadInitialDashboard();

    return () => {
      active = false;
    };
  }, [applyDashboardError, applyDashboardResponse]);

  return (
    <>
      <section className="soho-admin-section">
        <div className="soho-admin-section-header">
          <div>
            <span className="soho-gallery-kicker">Főoldal</span>
            <h2>Események</h2>
            <p>Új esemény létrehozása, borítókép feltöltése és a meglévő események kezelése.</p>
          </div>
        </div>

        <div className="soho-admin-grid">
          <AdminEventForm onSuccess={loadDashboard} />

          <AdminPreviewTable
            title="Létező események"
            resource="events"
            source={state.events.source}
            ok={state.events.ok}
            error={state.events.error}
            rows={state.events.data}
            columns={[
              "id",
              "title",
              "date",
              "time",
              "facebook_url",
              "cover_drive_file_id",
              "published",
              "sort_order",
            ]}
            editableFields={[
              "title",
              "date",
              "time",
              "facebook_url",
              "cover_drive_file_id",
              "cover_drive_url",
              "published",
              "sort_order",
            ]}
            onChange={loadDashboard}
            loading={state.loading && state.events.data.length === 0}
          />
        </div>
      </section>

      <section className="soho-admin-section">
        <div className="soho-admin-section-header">
          <div>
            <span className="soho-gallery-kicker">Főoldal</span>
            <h2>Facebook blokk</h2>
            <p>A „Kövess minket Facebookon” rész elemei képpel, szöveggel és hivatkozással.</p>
          </div>
        </div>

        <div className="soho-admin-grid">
          <AdminFacebookFeedForm onSuccess={loadDashboard} />

          <AdminPreviewTable
            title="Facebook elemek"
            resource="facebook_feed"
            source={state.facebookFeed.source}
            ok={state.facebookFeed.ok}
            error={state.facebookFeed.error}
            rows={state.facebookFeed.data}
            columns={[
              "id",
              "title",
              "text",
              "facebook_url",
              "cover_drive_file_id",
              "published",
              "sort_order",
            ]}
            editableFields={[
              "title",
              "text",
              "facebook_url",
              "cover_drive_file_id",
              "cover_drive_url",
              "published",
              "sort_order",
            ]}
            onChange={loadDashboard}
            loading={state.loading && state.facebookFeed.data.length === 0}
          />
        </div>
      </section>

      <AdminGalleryWorkspace
        albumsResult={{
          ok: state.galleryAlbums.ok,
          source: state.galleryAlbums.source,
          error: state.galleryAlbums.error,
          rows: state.galleryAlbums.data,
        }}
        onAlbumsChange={loadDashboard}
        loading={state.loading && state.galleryAlbums.data.length === 0}
      />
    </>
  );
}
