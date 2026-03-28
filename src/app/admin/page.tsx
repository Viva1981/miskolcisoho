import Link from "next/link";

import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminDriveStorageCard } from "@/components/admin-drive-storage-card";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { SohoHeader } from "@/components/soho-header";
import { requireAdminPageAuth } from "@/lib/admin-auth";
import { isAppsScriptConfigured } from "@/lib/apps-script";
import {
  getContentConfig,
  getGoogleDriveFolderUrl,
  getGoogleSheetUrl,
} from "@/lib/content-config";

export default async function AdminPage() {
  await requireAdminPageAuth();

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
            </div>
            <AdminLogoutButton />
          </div>

          <AdminDashboard />

          <details className="soho-admin-details">
            <summary>Haladó nézet és rendszerinformációk</summary>

            <div className="soho-admin-grid">
              <AdminDriveStorageCard />

              <article className="soho-admin-summary-card">
                <h2>Kapcsolódás</h2>
                <p>
                  {appsScriptReady
                    ? "A rendszer élő Google Drive és Google Sheets kapcsolattal működik."
                    : "Az élő kapcsolat még nincs teljesen beállítva, ezért a felület nem tud menteni."}
                </p>
                <span
                  className={`soho-admin-status-chip ${appsScriptReady ? "is-ok" : "is-error"}`}
                >
                  {appsScriptReady ? "Kapcsolódva" : "Nincs kapcsolat"}
                </span>
              </article>
            </div>

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
                <h2>Kapcsolat</h2>
                <ul className="soho-admin-step-list">
                  <li>stuller.zsolt@gmail.com</li>
                  <li>06703654185</li>
                  <li>Az oldalt készítette: Stuller Zsolt / CODEX_GPT-5.4</li>
                </ul>
              </article>
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}

