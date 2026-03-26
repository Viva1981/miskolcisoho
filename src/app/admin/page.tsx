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
    title: "Fooldali esemenyek",
    description:
      "Ezek adjak a hero alatti esemenykartyakat. Kesobb cim, datum, ido, Facebook link es boritokep is innen jon majd.",
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
    title: "Kovess minket Facebookon",
    description:
      "A feed kartyak cime, szovege, boritoja es a Facebook link is kulon kezelheto adatsorkent lesz tarolva.",
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
    title: "Galeria albumok",
    description:
      "A galeria ketszintu: album metaadatok kulon, az albumon beluli kepek kulon. Ezert kesobb jol skalazhato marad az admin.",
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
            Forras: <strong>{source}</strong>
          </p>
        </div>
        <span className={`soho-admin-status-chip ${ok ? "is-ok" : "is-error"}`}>
          {ok ? "kapcsolodva" : "hiba"}
        </span>
      </div>

      {!ok ? (
        <p className="soho-admin-error">{error ?? "Ismeretlen hiba."}</p>
      ) : rows.length === 0 ? (
        <p className="soho-admin-empty">
          Meg nincs adat ebben a forrasban. Ez jo tesztallapot: az elo kapcsolat mukodik, csak a
          sheet meg ures.
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
              <h1>Admin elokeszites</h1>
              <p>
                Ez mar a vegleges adatut szerinti admin alap: a fooldali esemenyek, a Facebook
                feed es a galeria egy kozos tartalommodellre keszulnek, amelyet kesobb Apps
                Scripten keresztul a Google Sheetekbol es Drive-bol fogunk olvasni es irni.
              </p>
            </div>

            <div className="soho-gallery-source-card">
              <strong>Drive gyoker</strong>
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
              <h2>Apps Script statusz</h2>
              <p>
                {appsScriptReady
                  ? "A kornyezeti valtozok be vannak allitva, a projekt keszen all az elo Apps Script kapcsolatra."
                  : "Meg nincs beallitva a Web App URL vagy a shared secret, ezert most mock adatokkal dolgozik a projekt."}
              </p>
              <div className="soho-admin-tag-block">
                <span>{appsScriptReady ? "apps-script-ready" : "mock-mode"}</span>
              </div>
            </article>
          </div>

          <div className="soho-admin-grid">
            <PreviewCard
              title="Events elonezet"
              source={eventsResult.source}
              ok={eventsResult.ok}
              error={eventsResult.error}
              rows={eventsResult.data}
              columns={["id", "title", "date", "time", "facebook_url", "published"]}
            />

            <PreviewCard
              title="Facebook feed elonezet"
              source={facebookFeedResult.source}
              ok={facebookFeedResult.ok}
              error={facebookFeedResult.error}
              rows={facebookFeedResult.data}
              columns={["id", "title", "text", "facebook_url", "published"]}
            />
          </div>

          <div className="soho-admin-grid">
            <article className="soho-admin-card">
              <h2>Apps Script muveletek</h2>
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
              <h2>Kovetkezo lepesek</h2>
              <ul className="soho-admin-list">
                <li>Events es Facebook feed letrehozas admin urlaprol</li>
                <li>Galeria albumok listazasa es letrehozasa</li>
                <li>Drive-alapu kepfeltoltes adminbol</li>
              </ul>
            </article>

            <article className="soho-admin-card">
              <h2>Dokumentacio</h2>
              <div className="soho-admin-link-list">
                <a
                  href="https://docs.google.com/spreadsheets/d/1iakm8kyLYBM8v0V5PgFfLkF3gSAHLMIkdq-w7yIGcts/edit"
                  target="_blank"
                  rel="noreferrer"
                >
                  events sheet
                </a>
                <Link href="/">Fooldal megnyitasa</Link>
                <Link href="/galeria">Galeria megnyitasa</Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
