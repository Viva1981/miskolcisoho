import Link from "next/link";
import { notFound } from "next/navigation";

import { SohoHeader } from "@/components/soho-header";
import { getGalleryAlbum, getGallerySlugs } from "@/lib/gallery";

type AlbumPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getGallerySlugs();
}

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

            <div className={`soho-gallery-album-hero ${album.coverTone}`}>
              <span>{album.eventDate}</span>
              <h1>{album.title}</h1>
              <p>{album.description}</p>
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
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{image.name}</strong>
                </div>
                <div className="soho-gallery-image-meta">
                  <h2>{image.alt}</h2>
                  <p>Később ez a hely a Google Drive-ból érkező valódi képet fogja mutatni.</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
