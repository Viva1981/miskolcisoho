import Link from "next/link";
import { notFound } from "next/navigation";

import { GalleryLightbox } from "@/components/gallery-lightbox";
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
              Vissza a galeriahoz
            </Link>
          </div>

          <GalleryLightbox
            title={album.title}
            eventDate={album.eventDate}
            images={album.images.map((image) => ({
              id: image.id,
              alt: image.alt,
              imageUrl: image.imageUrl,
            }))}
          />
        </div>
      </section>
    </main>
  );
}
