"use client";

import { useEffect, useState } from "react";

import type { HomepageEvent } from "@/lib/content";

type SohoEventsCarouselProps = {
  events: HomepageEvent[];
};

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13.5 21v-7.4h2.5l.4-3h-2.9V8.7c0-.9.2-1.5 1.5-1.5h1.6V4.5c-.3 0-.9-.1-2-.1-2 0-3.4 1.2-3.4 3.5v2.7H9v3h2.2V21h2.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 3h2v2h6V3h2v2h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V3Zm12 7H5v9h14v-9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm1 5h-2v6l5 3 1-1.7-4-2.3V7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15 5 8 12l7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m9 5 7 7-7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SohoEventsCarousel({ events }: SohoEventsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    if (mediaQuery.matches || events.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % events.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [events.length]);

  if (events.length === 0) {
    return null;
  }

  function goPrevious() {
    setActiveIndex((current) => (current - 1 + events.length) % events.length);
  }

  function goNext() {
    setActiveIndex((current) => (current + 1) % events.length);
  }

  const desktopCards = [
    events[activeIndex % events.length],
    events[(activeIndex + 1) % events.length],
    events[(activeIndex + 2) % events.length],
  ];
  const mobileCard = events[activeIndex % events.length];

  return (
    <section id="esemenyek" className="soho-events-section">
      <div className="soho-events-wrap">
        <h2>Közelgő események</h2>

        <div className="soho-events-desktop">
          <button
            type="button"
            className="soho-events-arrow left"
            aria-label="Előző események"
            onClick={goPrevious}
          >
            <ArrowLeftIcon />
          </button>

          <div className="soho-events-grid">
            {desktopCards.map((event) => (
              <article key={`${event.id}-desktop`} className="soho-event-card-v2">
                <div className={`soho-event-art ${event.accent}`}>
                  <span>DUMMY EVENT</span>
                  <strong>{event.title}</strong>
                </div>

                <div className="soho-event-body">
                  <div className="soho-event-meta">
                    <span>
                      <CalendarIcon />
                      {event.date}
                    </span>
                    <span>
                      <ClockIcon />
                      {event.time}
                    </span>
                  </div>

                  <h3>{event.title}</h3>

                  <div className="soho-event-actions">
                    <a href={event.facebookUrl} aria-label={`${event.title} Facebook esemény`}>
                      <FacebookIcon />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="soho-events-arrow right"
            aria-label="Következő események"
            onClick={goNext}
          >
            <ArrowRightIcon />
          </button>
        </div>

        <div className="soho-events-mobile">
          <article key={`${mobileCard.id}-mobile`} className="soho-event-card-v2">
            <div className={`soho-event-art ${mobileCard.accent}`}>
              <span>DUMMY EVENT</span>
              <strong>{mobileCard.title}</strong>
            </div>

            <div className="soho-event-body">
              <div className="soho-event-meta">
                <span>
                  <CalendarIcon />
                  {mobileCard.date}
                </span>
                <span>
                  <ClockIcon />
                  {mobileCard.time}
                </span>
              </div>

              <h3>{mobileCard.title}</h3>

              <div className="soho-event-actions">
                <a
                  href={mobileCard.facebookUrl}
                  aria-label={`${mobileCard.title} Facebook esemény`}
                >
                  <FacebookIcon />
                </a>
              </div>
            </div>
          </article>

          <button
            type="button"
            className="soho-events-arrow left"
            aria-label="Előző esemény"
            onClick={goPrevious}
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            className="soho-events-arrow right"
            aria-label="Következő esemény"
            onClick={goNext}
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
