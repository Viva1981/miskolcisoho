import Link from "next/link";

import { SohoHeader } from "@/components/soho-header";
import { getGalleryAlbums } from "@/lib/gallery";

export const revalidate = 300;

export default async function GaleriaPage() {
  const albums = await getGalleryAlbums();

  return (
    <main className="soho-landing">
      <SohoHeader />

      <section className="soho-gallery-shell">
        <div className="soho-gallery-wrap">
          <div className="soho-gallery-page-title">
            <h1>Galéria</h1>
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
                </div>

                <div className="soho-gallery-album-card-body">
                  <h2>{formatAlbumHeading(album.title, album.eventDate)}</h2>
                  <p>{album.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function formatAlbumHeading(title: string, eventDate: string) {
  const cleanDate = eventDate ? eventDate.replaceAll("-", ".") : "";
  return cleanDate ? `${title} | ${cleanDate}.` : title;
}
