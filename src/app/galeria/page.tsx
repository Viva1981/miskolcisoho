import Link from "next/link";

import { SohoHeader } from "@/components/soho-header";
import { getGalleryAlbums, getGalleryRootFolderId, isGoogleDriveLiveMode } from "@/lib/gallery";

export const revalidate = 60;

export default async function GaleriaPage() {
  const albums = await getGalleryAlbums();
  const driveRootFolderId = getGalleryRootFolderId();
  const isLiveMode = isGoogleDriveLiveMode();

  return (
    <main className="soho-landing">
      <SohoHeader />

      <section className="soho-gallery-shell">
        <div className="soho-gallery-wrap">
          <div className="soho-gallery-head">
            <div>
              <span className="soho-gallery-kicker">Google Drive Ready</span>
              <h1>Galéria</h1>
              <p>
                A galériaoldal most már a valódi album rekordokat és a hozzájuk feltöltött képeket
                olvassa. Az adminban létrehozott albumok és képek közvetlenül itt jelennek meg.
              </p>
            </div>

            <div className="soho-gallery-source-card">
              <strong>Forrás</strong>
              <span>{isLiveMode ? "Google Drive live mód" : "Google Drive mock mód"}</span>
              <code>{driveRootFolderId}</code>
            </div>
          </div>

          <div className="soho-gallery-album-grid">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/galeria/${album.slug}`}
                className="soho-gallery-album-card"
              >
                <div
                  className={`soho-gallery-album-cover ${album.coverTone} ${album.coverImageUrl ? "has-image" : ""}`}
                >
                  {album.coverImageUrl ? (
                    <img
                      src={album.coverImageUrl}
                      alt={album.title}
                      className="soho-gallery-cover-image"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="soho-gallery-cover-overlay">
                    <span>{album.eventDate}</span>
                    <strong>{album.title}</strong>
                  </div>
                </div>

                <div className="soho-gallery-album-copy">
                  <h2>{album.title}</h2>
                  <p>{album.description}</p>

                  <div className="soho-gallery-tag-row">
                    {album.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <div className="soho-gallery-meta-row">
                    <span>{album.images.length} kép</span>
                    <span>Drive album</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
