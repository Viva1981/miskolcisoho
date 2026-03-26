import Link from "next/link";

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
    title: "F\u0151oldali esem\u00e9nyek",
    description:
      "Ezek adj\u00e1k a hero alatti esem\u00e9nyk\u00e1rty\u00e1kat. K\u00e9s\u0151bb c\u00edm, d\u00e1tum, id\u0151, Facebook link \u00e9s bor\u00edt\u00f3k\u00e9p is innen j\u00f6n majd.",
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
    title: "K\u00f6vess minket Facebookon",
    description:
      "A feed k\u00e1rty\u00e1k c\u00edme, sz\u00f6vege, bor\u00edt\u00f3ja \u00e9s a Facebook link is k\u00fcl\u00f6n kezelhet\u0151 adatsork\u00e9nt lesz t\u00e1rolva.",
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
    title: "Gal\u00e9ria albumok",
    description:
      "A gal\u00e9ria k\u00e9tszint\u0171: album metaadatok k\u00fcl\u00f6n, az albumon bel\u00fcli k\u00e9pek k\u00fcl\u00f6n. Ez\u00e9rt k\u00e9s\u0151bb j\u00f3l sk\u00e1l\u00e1zhat\u00f3 marad az admin.",
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
            Forr\u00e1s: <strong>{source}</strong>
          </p>
        </div>
        <span className={`soho-admin-status-chip ${ok ? "is-ok" : "is-error"}`}>
          {ok ? "kapcsol\u00f3dva" : "hiba"}
        </span>
      </div>

      {!ok ? (
        <p className="soho-admin-error">{error ?? "Ismeretlen hiba."}</p>
      ) : rows.length === 0 ? (
        <p className="soho-admin-empty">
          M\u00e9g nincs adat ebben a forr\u00e1sban. Ez j\u00f3 teszt\u00e1llapot: az \u00e9l\u0151 kapcsolat m\u0171k\u00f6dik, csak a
          sheet m\u00e9g \u00fcres.
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
  const [eventsResult, facebookFeedResult] = await Promise.all([
    getAdminContent("events"),
    getAdminContent("facebook_feed"),
  ]);

  return (
    <main className="soho-landing">
      <SohoHeader />

      <section className="soho-admin-shell">
        <div className="soho-admin-wrap">
          <div className="soho-admin-head">
            <div>
              <span className="soho-gallery-kicker">Admin Architecture</span>
              <h1>Admin el\u0151k\u00e9sz\u00edt\u00e9s</h1>
              <p>
                Ez m\u00e1r a v\u00e9gleges adat\u00fat szerinti admin alap: a f\u0151oldali esem\u00e9nyek, a Facebook
                feed \u00e9s a gal\u00e9ria egy k\u00f6z\u00f6s tartalommodellre k\u00e9sz\u00fclnek, amelyet k\u00e9s\u0151bb Apps
                Scripten kereszt\u00fcl a Google Sheetekb\u0151l \u00e9s Drive-b\u00f3l fogunk olvasni \u00e9s \u00edrni.
              </p>
            </div>

            <div className="soho-gallery-source-card">
              <strong>Drive gy\u00f6k\u00e9r</strong>
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
                  ? "A k\u00f6rnyezeti v\u00e1ltoz\u00f3k be vannak \u00e1ll\u00edtva, a projekt k\u00e9szen \u00e1ll az \u00e9l\u0151 Apps Script kapcsolatra."
                  : "M\u00e9g nincs be\u00e1ll\u00edtva a Web App URL vagy a shared secret, ez\u00e9rt most mock adatokkal dolgozik a projekt."}
              </p>
              <div className="soho-admin-tag-block">
                <span>{appsScriptReady ? "apps-script-ready" : "mock-mode"}</span>
              </div>
            </article>
          </div>

          <div className="soho-admin-grid">
            <PreviewCard
              title="Events el\u0151n\u00e9zet"
              source={eventsResult.source}
              ok={eventsResult.ok}
              error={eventsResult.error}
              rows={eventsResult.data}
              columns={["id", "title", "date", "time", "facebook_url", "published"]}
            />

            <PreviewCard
              title="Facebook feed el\u0151n\u00e9zet"
              source={facebookFeedResult.source}
              ok={facebookFeedResult.ok}
              error={facebookFeedResult.error}
              rows={facebookFeedResult.data}
              columns={["id", "title", "text", "facebook_url", "published"]}
            />
          </div>

          <div className="soho-admin-grid">
            <article className="soho-admin-card">
              <h2>Apps Script műveletek</h2>
              <div className="soho-admin-tag-block">
                {apiActions.map((action) => (
                  <span key={action}>{action}</span>
                ))}
              </div>
            </article>

            <article className="soho-admin-card">
              <h2>API teszt linkek</h2>
              <div className="soho-admin-link-list">
                <Link href="/api/admin/content?resource=events">API minta: events</Link>
                <Link href="/api/admin/content?resource=facebook_feed">
                  API minta: facebook_feed
                </Link>
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

          <div className="soho-admin-grid soho-admin-grid-bottom">
            <article className="soho-admin-card">
              <h2>K\u00f6vetkez\u0151 l\u00e9p\u00e9sek</h2>
              <ul className="soho-admin-list">
                <li>Events \u00e9s Facebook feed l\u00e9trehoz\u00e1s admin \u0171rlapr\u00f3l</li>
                <li>Gal\u00e9ria albumok list\u00e1z\u00e1sa \u00e9s l\u00e9trehoz\u00e1sa</li>
                <li>Drive-alap\u00fa k\u00e9pfelt\u00f6lt\u00e9s adminb\u00f3l</li>
              </ul>
            </article>

            <article className="soho-admin-card">
              <h2>Dokument\u00e1ci\u00f3</h2>
              <div className="soho-admin-link-list">
                <a
                  href="https://docs.google.com/spreadsheets/d/1iakm8kyLYBM8v0V5PgFfLkF3gSAHLMIkdq-w7yIGcts/edit"
                  target="_blank"
                  rel="noreferrer"
                >
                  events sheet
                </a>
                <Link href="/">F\u0151oldal megnyit\u00e1sa</Link>
                <Link href="/galeria">Gal\u00e9ria megnyit\u00e1sa</Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
