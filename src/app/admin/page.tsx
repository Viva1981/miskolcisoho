import Link from "next/link";

import { AdminEventForm } from "@/components/admin-event-form";
import { AdminFacebookFeedForm } from "@/components/admin-facebook-feed-form";
import { AdminGalleryWorkspace } from "@/components/admin-gallery-workspace";
import { AdminPreviewTable } from "@/components/admin-preview-table";
import { SohoHeader } from "@/components/soho-header";
import { getAdminContent } from "@/lib/admin-content";
import { isAppsScriptConfigured } from "@/lib/apps-script";
import {
  getContentConfig,
  getGoogleDriveFolderUrl,
  getGoogleSheetUrl,
} from "@/lib/content-config";

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
          <div className="soho-admin-head soho-admin-head-clean">
            <div>
              <span className="soho-gallery-kicker">Tartalomkezelő</span>
              <h1>Admin felület</h1>
              <p>
                Itt tudod kezelni a főoldali eseményeket, a Facebook blokkot és a galériákat. A cél
                az, hogy minden fontos művelet néhány egyértelmű lépésből álljon, technikai
                háttértudás nélkül is.
              </p>
            </div>

            <article className="soho-admin-summary-card">
              <h2>Kapcsolódás</h2>
              <p>
                {appsScriptReady
                  ? "A rendszer élő Google Drive és Google Sheets kapcsolattal működik."
                  : "Az élő kapcsolat még nincs teljesen beállítva, ezért a felület nem tud menteni."}
              </p>
              <span className={`soho-admin-status-chip ${appsScriptReady ? "is-ok" : "is-error"}`}>
                {appsScriptReady ? "Kapcsolódva" : "Nincs kapcsolat"}
              </span>
            </article>
          </div>

          <div className="soho-admin-quickstart">
            <article className="soho-admin-card">
              <h2>Gyors indulás</h2>
              <ol className="soho-admin-step-list">
                <li>Eseményhez vagy Facebook kártyához először töltsd ki az űrlapot.</li>
                <li>Galériánál előbb hozz létre egy albumot, utána válaszd ki és tölts fel képeket hozzá.</li>
                <li>A jobb oldali listákban azonnal szerkesztheted, rejtheted vagy törölheted a tartalmat.</li>
              </ol>
            </article>

            <article className="soho-admin-card">
              <h2>Fontos tudnivaló</h2>
              <p className="soho-admin-muted">
                A publikus oldal automatikusan frissül mentés után. A galéria képei most már csak
                albumválasztás után töltődnek be, ezért az admin újratöltése is gyorsabb lett.
              </p>
            </article>
          </div>

          <section className="soho-admin-section">
            <div className="soho-admin-section-header">
              <div>
                <span className="soho-gallery-kicker">Főoldal</span>
                <h2>Események</h2>
                <p>Új esemény létrehozása, borítókép feltöltése és a meglévő események kezelése.</p>
              </div>
            </div>

            <div className="soho-admin-grid">
              <AdminEventForm />

              <AdminPreviewTable
                title="Létező események"
                resource="events"
                source={eventsResult.source}
                ok={eventsResult.ok}
                error={eventsResult.error}
                rows={eventsResult.data}
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
              <AdminFacebookFeedForm />

              <AdminPreviewTable
                title="Facebook elemek"
                resource="facebook_feed"
                source={facebookFeedResult.source}
                ok={facebookFeedResult.ok}
                error={facebookFeedResult.error}
                rows={facebookFeedResult.data}
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
              />
            </div>
          </section>

          <AdminGalleryWorkspace
            albumsResult={{
              ok: galleryAlbumsResult.ok,
              source: galleryAlbumsResult.source,
              error: galleryAlbumsResult.error,
              rows: galleryAlbumsResult.data,
            }}
          />

          <details className="soho-admin-details">
            <summary>Haladó nézet és rendszerinformációk</summary>

            <div className="soho-admin-grid">
              <article className="soho-admin-card">
                <h2>Kapcsolt táblák</h2>
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
                <h2>Drive gyökér</h2>
                <div className="soho-admin-link-list">
                  <a
                    href={getGoogleDriveFolderUrl(config.driveRootFolderId)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Soho_Content mappa megnyitása
                  </a>
                </div>
                <code className="soho-admin-code">{config.driveRootFolderId}</code>
              </article>
            </div>

            <div className="soho-admin-grid">
              <article className="soho-admin-card">
                <h2>API teszt linkek</h2>
                <div className="soho-admin-link-list">
                  <Link href="/api/admin/content?resource=events">events</Link>
                  <Link href="/api/admin/content?resource=facebook_feed">facebook_feed</Link>
                  <Link href="/api/admin/content?resource=gallery_albums">gallery_albums</Link>
                  <Link href="/api/admin/content?resource=gallery_images">gallery_images</Link>
                </div>
              </article>

              <article className="soho-admin-card">
                <h2>Segítség</h2>
                <ul className="soho-admin-step-list">
                  <li>Ha valami nem jelenik meg az oldalon, frissíts rá egyszer az adminra is.</li>
                  <li>Galéria képnél az album kiválasztása automatikusan kitölti a Drive mappát.</li>
                  <li>A gyorsgombokkal publikálást és sorrendet is tudsz módosítani.</li>
                </ul>
              </article>
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
