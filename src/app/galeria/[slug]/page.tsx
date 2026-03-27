import Link from "next/link";
import { notFound } from "next/navigation";

import { SohoHeader } from "@/components/soho-header";
import { getGalleryAlbum } from "@/lib/gallery";

export const revalidate = 60;

type AlbumPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = await params;
  const album = await getGalleryAlbum(slug);

  if (!album) {
    notFound();
  }

  return (
    <main className="soho-landing">
      <SohoHeader />

      <section className="soho-gallery-shell">
        <div className="soho-gallery-wrap">
          <div className="soho-gallery-album-head">
            <Link href="/galeria" className="soho-gallery-backlink">
              Vissza a galériához
            </Link>

            <div
              className={`soho-gallery-album-hero ${album.coverTone} ${album.coverImageUrl ? "has-image" : ""}`}
            >
              {album.coverImageUrl ? (
                <img
                  src={album.coverImageUrl}
                  alt={album.title}
                  className="soho-gallery-cover-image"
                  loading="eager"
                />
              ) : null}
              <div className="soho-gallery-cover-overlay">
                <span>{album.eventDate}</span>
                <h1>{album.title}</h1>
                <p>{album.description}</p>
              </div>
            </div>

            <div className="soho-gallery-tag-row">
              {album.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>

          <div className="soho-gallery-image-grid">
            {album.images.map((image, index) => (
              <article key={image.id} className={`soho-gallery-image-card ${image.tone}`}>
                <div className="soho-gallery-image-placeholder">
                  {image.imageUrl ? (
                    <img
                      src={image.imageUrl}
                      alt={image.alt}
                      className="soho-gallery-item-image"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="soho-gallery-cover-overlay">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{image.caption || image.alt}</strong>
                  </div>
                </div>
                <div className="soho-gallery-image-meta">
                  <h2>{image.alt}</h2>
                  <p>{image.caption || "Galéria kép a Soho élő tartalmából."}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
