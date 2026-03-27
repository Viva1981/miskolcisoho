"use client";

import { useEffect, useMemo, useState } from "react";

type GalleryLightboxImage = {
  id: string;
  alt: string;
  imageUrl?: string;
};

type GalleryLightboxProps = {
  title: string;
  eventDate: string;
  images: GalleryLightboxImage[];
};

export function GalleryLightbox({ title, eventDate, images }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const visibleImages = useMemo(() => images.filter((image) => image.imageUrl), [images]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => {
          if (current === null) {
            return 0;
          }

          return (current + 1) % visibleImages.length;
        });
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => {
          if (current === null) {
            return 0;
          }

          return (current - 1 + visibleImages.length) % visibleImages.length;
        });
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [activeIndex, visibleImages.length]);

  function openImage(index: number) {
    setActiveIndex(index);
  }

  function closeLightbox() {
    setActiveIndex(null);
  }

  function showNext() {
    setActiveIndex((current) => {
      if (current === null) {
        return 0;
      }

      return (current + 1) % visibleImages.length;
    });
  }

  function showPrevious() {
    setActiveIndex((current) => {
      if (current === null) {
        return 0;
      }

      return (current - 1 + visibleImages.length) % visibleImages.length;
    });
  }

  function handleTouchStart(clientX: number) {
    setTouchStartX(clientX);
  }

  function handleTouchEnd(clientX: number) {
    if (touchStartX === null) {
      return;
    }

    const delta = clientX - touchStartX;
    setTouchStartX(null);

    if (Math.abs(delta) < 40) {
      return;
    }

    if (delta < 0) {
      showNext();
      return;
    }

    showPrevious();
  }

  const activeImage = activeIndex === null ? null : visibleImages[activeIndex];

  return (
    <>
      <div className="soho-gallery-album-head">
        <div className="soho-gallery-album-title-block">
          <p>{eventDate}</p>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="soho-gallery-image-grid soho-gallery-image-grid-clean">
        {visibleImages.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className="soho-gallery-image-button"
            onClick={() => openImage(index)}
          >
            <img
              src={image.imageUrl}
              alt={image.alt}
              className="soho-gallery-item-image soho-gallery-item-image-static"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {activeImage ? (
        <div
          className="soho-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} galeria`}
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="soho-lightbox-close"
            aria-label="Galeria bezarasa"
            onClick={closeLightbox}
          >
            ×
          </button>

          {visibleImages.length > 1 ? (
            <>
              <button
                type="button"
                className="soho-lightbox-arrow is-prev"
                aria-label="Elozo kep"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
              >
                ‹
              </button>

              <button
                type="button"
                className="soho-lightbox-arrow is-next"
                aria-label="Kovetkezo kep"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
              >
                ›
              </button>
            </>
          ) : null}

          <div
            className="soho-lightbox-stage"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => handleTouchStart(event.changedTouches[0]?.clientX ?? 0)}
            onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
          >
            <img src={activeImage.imageUrl} alt={activeImage.alt} className="soho-lightbox-image" />
          </div>
        </div>
      ) : null}
    </>
  );
}
