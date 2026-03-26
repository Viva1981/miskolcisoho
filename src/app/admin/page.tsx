import Link from "next/link";

import { AdminEventForm } from "@/components/admin-event-form";
import { AdminFacebookFeedForm } from "@/components/admin-facebook-feed-form";
import { AdminGalleryAlbumForm } from "@/components/admin-gallery-album-form";
import { SohoHeader } from "@/components/soho-header";
import { getAdminContent } from "@/lib/admin-content";
import { isAppsScriptConfigured } from "@/lib/apps-script";
import {
  getContentConfig,
  getGoogleDriveFolderUrl,
  getGoogleSheetUrl,
} from "@/lib/content-config";

const adminSections = [
  {
    id: "events",
    title: "Főoldali események",
    description:
      "Ezek adják a hero alatti eseménykártyákat. Később cím, dátum, idő, Facebook link és borítókép is innen jön majd.",
    fields: [
      "title",
      "date",
      "time",
      "facebook_url",
      "cover_drive_file_id",
      "published",
      "sort_order",
    ],
  },
  {
    id: "facebook-feed",
    title: "Kövess minket Facebookon",
    description:
      "A feed kártyák címe, szövege, borítója és a Facebook link is külön kezelhető adatsorként lesz tárolva.",
    fields: [
      "title",
      "text",
      "facebook_url",
      "cover_drive_file_id",
      "published",
      "sort_order",
    ],
  },
  {
    id: "gallery",
    title: "Galéria albumok",
    description:
      "A galéria kétszintű: album metaadatok külön, az albumon belüli képek külön. Ezért később jól skálázható marad az admin.",
    fields: [
      "title",
      "slug",
      "event_date",
      "description",
      "drive_folder_id",
      "cover_drive_file_id",
      "published",
      "sort_order",
    ],
  },
] as const;

const apiActions = [
  "GET_CONTENT",
  "CREATE_ROW",
  "UPDATE_ROW",
  "DELETE_ROW",
  "UPLOAD_DRIVE_FILE",
] as const;

type PreviewCardProps = {
  title: string;
  source: "mock" | "apps-script";
  ok: boolean;
  error?: string;
  rows: Record<string, string>[];
  columns: string[];
};

function PreviewCard({ title, source, ok, error, rows, columns }: PreviewCardProps) {
  return (
    <article className="soho-admin-card soho-admin-preview-card">
      <div className="soho-admin-preview-head">
        <div>
          <h2>{title}</h2>
          <p>
            Forrás: <strong>{source}</strong>
          </p>
        </div>
        <span className={`soho-admin-status-chip ${ok ? "is-ok" : "is-error"}`}>
          {ok ? "kapcsolódva" : "hiba"}
        </span>
      </div>

      {!ok ? (
        <p className="soho-admin-error">{error ?? "Ismeretlen hiba."}</p>
      ) : rows.length === 0 ? (
        <p className="soho-admin-empty">
          Még nincs adat ebben a forrásban. Ez jó tesztállapot: az élő kapcsolat működik, csak a
          sheet még üres.
        </p>
      ) : (
        <div className="soho-admin-table-wrap">
          <table className="soho-admin-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 5).map((row) => (
                <tr key={row.id ?? `${title}-${JSON.stringify(row)}`}>
                  {columns.map((column) => (
                    <td key={column}>{row[column] || "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

export default async function AdminPage() {
  const config = getContentConfig();
  const appsScriptReady = isAppsScriptConfigured();
  const [eventsResult, facebookFeedResult, galleryAlbumsResult] = await Promise.all([
    getAdminContent("events"),
    getAdminContent("facebook_feed"),
    getAdminContent("gallery_albums"),
  ]);

  return (
    <main className="soho-landing">
      <SohoHeader />

      <section className="soho-admin-shell">
        <div className="soho-admin-wrap">
          <div className="soho-admin-head">
            <div>
              <span className="soho-gallery-kicker">Admin Architecture</span>
              <h1>Admin előkészítés</h1>
              <p>
                Ez már a végleges adatút szerinti admin alap: a főoldali események, a Facebook
                feed és a galéria egy közös tartalommodellre készülnek, amelyet később Apps
                Scripten keresztül a Google Sheetekből és Drive-ból fogunk olvasni és írni.
              </p>
            </div>

            <div className="soho-gallery-source-card">
              <strong>Drive gyökér</strong>
              <a
                href={getGoogleDriveFolderUrl(config.driveRootFolderId)}
                target="_blank"
                rel="noreferrer"
              >
                Soho_Content mappa
              </a>
              <code>{config.driveRootFolderId}</code>
            </div>
          </div>

          <div className="soho-admin-grid">
            <article className="soho-admin-card">
              <h2>Kapcsolt Sheetek</h2>
              <div className="soho-admin-link-list">
                <a href={getGoogleSheetUrl(config.sheets.events)} target="_blank" rel="noreferrer">
                  events
                </a>
                <a
                  href={getGoogleSheetUrl(config.sheets.facebookFeed)}
                  target="_blank"
                  rel="noreferrer"
                >
                  facebook_feed
                </a>
                <a
                  href={getGoogleSheetUrl(config.sheets.galleryAlbums)}
                  target="_blank"
                  rel="noreferrer"
                >
                  gallery_albums
                </a>
                <a
                  href={getGoogleSheetUrl(config.sheets.galleryImages)}
                  target="_blank"
                  rel="noreferrer"
                >
                  gallery_images
                </a>
              </div>
            </article>

            <article className="soho-admin-card">
              <h2>Apps Script státusz</h2>
              <p>
                {appsScriptReady
                  ? "A környezeti változók be vannak állítva, a projekt készen áll az élő Apps Script kapcsolatra."
                  : "Még nincs beállítva a Web App URL vagy a shared secret, ezért most mock adatokkal dolgozik a projekt."}
              </p>
              <div className="soho-admin-tag-block">
                <span>{appsScriptReady ? "apps-script-ready" : "mock-mode"}</span>
              </div>
            </article>
          </div>

          <div className="soho-admin-grid">
            <AdminEventForm />

            <PreviewCard
              title="Events előnézet"
              source={eventsResult.source}
              ok={eventsResult.ok}
              error={eventsResult.error}
              rows={eventsResult.data}
              columns={["id", "title", "date", "time", "facebook_url", "published"]}
            />
          </div>

          <div className="soho-admin-grid">
            <AdminFacebookFeedForm />

            <PreviewCard
              title="Facebook feed előnézet"
              source={facebookFeedResult.source}
              ok={facebookFeedResult.ok}
              error={facebookFeedResult.error}
              rows={facebookFeedResult.data}
              columns={["id", "title", "text", "facebook_url", "published"]}
            />
          </div>

          <div className="soho-admin-grid">
            <AdminGalleryAlbumForm />

            <PreviewCard
              title="Galéria albumok előnézet"
              source={galleryAlbumsResult.source}
              ok={galleryAlbumsResult.ok}
              error={galleryAlbumsResult.error}
              rows={galleryAlbumsResult.data}
              columns={["id", "slug", "title", "event_date", "drive_folder_id", "published"]}
            />
          </div>

          <div className="soho-admin-grid">
            <article className="soho-admin-card">
              <h2>API teszt linkek</h2>
              <div className="soho-admin-link-list">
                <Link href="/api/admin/content?resource=events">API minta: events</Link>
                <Link href="/api/admin/content?resource=facebook_feed">
                  API minta: facebook_feed
                </Link>
                <Link href="/api/admin/content?resource=gallery_albums">
                  API minta: gallery_albums
                </Link>
              </div>
            </article>

            <article className="soho-admin-card">
              <h2>Apps Script műveletek</h2>
              <div className="soho-admin-tag-block">
                {apiActions.map((action) => (
                  <span key={action}>{action}</span>
                ))}
              </div>
            </article>
          </div>

          <div className="soho-admin-grid">
            <article className="soho-admin-card">
              <h2>Következő lépések</h2>
              <ul className="soho-admin-list">
                <li>Galéria képek listázása és hozzáadása</li>
                <li>Drive-alapú képfeltöltés adminból</li>
                <li>Később szerkesztés és törlés hozzáadása</li>
              </ul>
            </article>

            <article className="soho-admin-card">
              <h2>Dokumentáció</h2>
              <div className="soho-admin-link-list">
                <a
                  href="https://docs.google.com/spreadsheets/d/1iakm8kyLYBM8v0V5PgFfLkF3gSAHLMIkdq-w7yIGcts/edit"
                  target="_blank"
                  rel="noreferrer"
                >
                  events sheet
                </a>
                <a
                  href="https://docs.google.com/spreadsheets/d/1ONaRhHY1NB-SHonXu-zT7s7E2nMs40TpUC92lbbqm9k/edit"
                  target="_blank"
                  rel="noreferrer"
                >
                  facebook_feed sheet
                </a>
                <a
                  href="https://docs.google.com/spreadsheets/d/1e6sL_r0AKtf50Ne0zk0yGi3cusEoHVYIknf37cxZiWo/edit"
                  target="_blank"
                  rel="noreferrer"
                >
                  gallery_albums sheet
                </a>
                <Link href="/">Főoldal megnyitása</Link>
                <Link href="/galeria">Galéria megnyitása</Link>
              </div>
            </article>
          </div>

          <div className="soho-admin-section-list">
            {adminSections.map((section) => (
              <article key={section.id} className="soho-admin-section-card">
                <div className="soho-admin-section-copy">
                  <h2>{section.title}</h2>
                  <p>{section.description}</p>
                </div>

                <div className="soho-admin-tag-block">
                  {section.fields.map((field) => (
                    <span key={field}>{field}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
