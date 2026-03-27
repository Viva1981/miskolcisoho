import Link from "next/link";

import { AdminEventForm } from "@/components/admin-event-form";
import { AdminFacebookFeedForm } from "@/components/admin-facebook-feed-form";
import { AdminGalleryAlbumForm } from "@/components/admin-gallery-album-form";
import { AdminGalleryImageForm } from "@/components/admin-gallery-image-form";
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
  const [eventsResult, facebookFeedResult, galleryAlbumsResult, galleryImagesResult] =
    await Promise.all([
      getAdminContent("events"),
      getAdminContent("facebook_feed"),
      getAdminContent("gallery_albums"),
      getAdminContent("gallery_images"),
    ]);

  const galleryAlbumOptions = galleryAlbumsResult.data.map((album) => ({
    id: album.id ?? "",
    title: album.title ?? album.slug ?? album.id ?? "Névtelen album",
    driveFolderId: album.drive_folder_id ?? "",
  }));

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
                Itt tudod kezelni a főoldali eseményeket, a Facebook blokkot és a galériákat. A
                cél az, hogy minden fontos művelet néhány egyértelmű lépésből álljon, technikai
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
                <li>Galériánál előbb hozz létre egy albumot, utána tölts fel képeket hozzá.</li>
                <li>A jobb oldali listákban azonnal szerkesztheted, rejtheted vagy törölheted a tartalmat.</li>
              </ol>
            </article>

            <article className="soho-admin-card">
              <h2>Fontos tudnivaló</h2>
              <p className="soho-admin-muted">
                A mentés után a publikus oldal automatikusan frissül. Ha több galériaképet töltesz
                fel egyszerre, a rendszer egymás után végigfut rajtuk.
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
                <p>A “Kövess minket Facebookon” rész elemei képpel, szöveggel és hivatkozással.</p>
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

          <section className="soho-admin-section">
            <div className="soho-admin-section-header">
              <div>
                <span className="soho-gallery-kicker">Galéria</span>
                <h2>Albumok és képek</h2>
                <p>
                  Először hozz létre egy új albumot borítóképpel, utána töltsd fel hozzá a galéria
                  képeit.
                </p>
              </div>
            </div>

            <div className="soho-admin-grid">
              <AdminGalleryAlbumForm />

              <AdminPreviewTable
                title="Galéria albumok"
                resource="gallery_albums"
                source={galleryAlbumsResult.source}
                ok={galleryAlbumsResult.ok}
                error={galleryAlbumsResult.error}
                rows={galleryAlbumsResult.data}
                columns={[
                  "id",
                  "slug",
                  "title",
                  "event_date",
                  "drive_folder_id",
                  "published",
                  "sort_order",
                ]}
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
              />
            </div>

            <div className="soho-admin-grid">
              <AdminGalleryImageForm albumOptions={galleryAlbumOptions} />

              <AdminPreviewTable
                title="Galéria képek"
                resource="gallery_images"
                source={galleryImagesResult.source}
                ok={galleryImagesResult.ok}
                error={galleryImagesResult.error}
                rows={galleryImagesResult.data}
                columns={[
                  "id",
                  "album_id",
                  "drive_file_id",
                  "drive_file_url",
                  "caption",
                  "sort_order",
                ]}
                editableFields={[
                  "album_id",
                  "drive_file_id",
                  "drive_file_url",
                  "caption",
                  "sort_order",
                ]}
              />
            </div>
          </section>

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
                  <li>A táblákban a publikálás és a sorrend gyorsgombokkal is módosítható.</li>
                </ul>
              </article>
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
