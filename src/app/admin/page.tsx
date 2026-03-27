import Link from "next/link";

import { AdminDashboard } from "@/components/admin-dashboard";
import { SohoHeader } from "@/components/soho-header";
import { isAppsScriptConfigured } from "@/lib/apps-script";
import {
  getContentConfig,
  getGoogleDriveFolderUrl,
  getGoogleSheetUrl,
} from "@/lib/content-config";

export default function AdminPage() {
  const config = getContentConfig();
  const appsScriptReady = isAppsScriptConfigured();

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
                Az admin váz most már azonnal betölt, a tartalmi listák pedig külön kérésben érkeznek
                meg. Ettől az első oldalbetöltés és az újratöltés is érezhetően gyorsabb lesz.
              </p>
            </article>
          </div>

          <AdminDashboard />

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
