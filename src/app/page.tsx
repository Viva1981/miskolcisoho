import Image from "next/image";
import { Bebas_Neue } from "next/font/google";

import { SohoEventsCarousel } from "@/components/soho-events-carousel";
import { SohoHeader } from "@/components/soho-header";
import { getFacebookFeedItems, getHomepageEvents } from "@/lib/content";

export const revalidate = 300;

const sohoDisplay = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});

function FacebookFooterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-6.84H7.96V12H10V9.8c0-2.02 1.2-3.14 3.04-3.14.88 0 1.8.16 1.8.16v1.98h-1.02c-1 0-1.32.62-1.32 1.26V12h2.24l-.36 2.96H12.5v6.84c4.56-.93 8-4.96 8-9.8 0-5.52-4.48-10-10-10Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramFooterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2.2A1.8 1.8 0 0 0 5.2 7v10A1.8 1.8 0 0 0 7 18.8h10a1.8 1.8 0 0 0 1.8-1.8V7A1.8 1.8 0 0 0 17 5.2H7Zm10.3 1.65a.95.95 0 1 1 0 1.9.95.95 0 0 1 0-1.9ZM12 7.4A4.6 4.6 0 1 1 7.4 12 4.6 4.6 0 0 1 12 7.4Zm0 2.2A2.4 2.4 0 1 0 14.4 12 2.4 2.4 0 0 0 12 9.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CookieIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14.7 2.5a3 3 0 0 0 4 3.8 7.8 7.8 0 1 1-6.5-2.8 3 3 0 0 0 2.5-1Zm-6 8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm5.4 4.4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2-5.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm6 1.8V9h4.2L13 4.8ZM9 12.2h6v1.6H9v-1.6Zm0 3.4h6v1.6H9v-1.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2 8 5 8-5H4Zm16 10V9l-8 5-8-5v8h16Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default async function Home() {
  const [homepageEvents, facebookFeedItems] = await Promise.all([
    getHomepageEvents(),
    getFacebookFeedItems(),
  ]);

  return (
    <main className={`soho-landing ${sohoDisplay.className}`}>
      <SohoHeader />

      <section id="fooldal" className="soho-hero-v2">
        <div className="soho-hero-inner">
          <Image
            src="/branding/soho_logo.png"
            alt="SOHO Miskolc"
            width={620}
            height={248}
            className="soho-hero-logo"
            priority
          />

          <div className="soho-hero-actions-v2">
            <a href="#esemenyek" className="soho-pill-button">
              Eseményeink
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61575425759586&locale=hu_HU"
              target="_blank"
              rel="noreferrer"
              className="soho-pill-button"
            >
              Facebook
            </a>
          </div>
        </div>
      </section>

      <SohoEventsCarousel events={homepageEvents} />

      <section id="facebook" className="soho-facebook-section">
        <div className="soho-facebook-wrap">
          <h2>Kövess minket Facebookon</h2>

          <div className="soho-facebook-profile">
            <Image
              src="/branding/soho_logo.png"
              alt="SOHO Miskolc"
              width={96}
              height={96}
              className="soho-facebook-avatar"
            />

            <div className="soho-facebook-profile-copy">
              <strong>soho miskolc</strong>
            </div>
          </div>

          <div className="soho-facebook-grid">
            {facebookFeedItems.slice(0, 9).map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="soho-facebook-card link"
                aria-label={item.title}
              >
                <div
                  className={`soho-facebook-thumb ${item.tone} ${
                    item.coverImageUrl ? "has-image" : ""
                  }`}
                >
                  {item.coverImageUrl ? (
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="soho-facebook-thumb-image"
                      loading="lazy"
                    />
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="soho-footer">
        <div className="soho-footer-grid">
          <div className="soho-footer-brand">
            <Image
              src="/branding/soho_logo.png"
              alt="SOHO Miskolc"
              width={320}
              height={174}
              className="soho-footer-logo"
            />

            <p>
              A Miskolci Soho négy helyi vállalkozás -{" "}
              <a
                href="https://alevesesburger.hu/"
                target="_blank"
                rel="noreferrer"
                className="soho-footer-inline-link"
              >
                A LEVES és BURGER
              </a>
              ,{" "}
              <a
                href="https://melonbar.hu/"
                target="_blank"
                rel="noreferrer"
                className="soho-footer-inline-link"
              >
                a Melon Cafe
              </a>
              ,{" "}
              <a
                href="https://www.rockabillychicken.hu/"
                target="_blank"
                rel="noreferrer"
                className="soho-footer-inline-link"
              >
                a Rockabilly Chicken
              </a>{" "}
              és az Ex-Home Apartmanházak összefogásából született. Az a célunk, hogy egy olyan
              városi szegletet teremtsünk, amely él, lélegzik, és ahol jó megállni, leülni,
              találkozni.
            </p>

            <div className="soho-footer-socials">
              <a
                href="https://www.facebook.com/profile.php?id=61575425759586&locale=hu_HU"
                target="_blank"
                rel="noreferrer"
                aria-label="Soho Facebook"
              >
                <FacebookFooterIcon />
              </a>
              <a href="#" aria-label="Soho Instagram">
                <InstagramFooterIcon />
              </a>
            </div>
          </div>

          <div className="soho-footer-meta">
            <div className="soho-footer-block">
              <h3>Dokumentumok</h3>
              <a href="#">
                <CookieIcon />
                <span>Adatkezelési tájékoztató</span>
              </a>
              <a href="#">
                <DocumentIcon />
                <span>Általános házirend</span>
              </a>
            </div>

            <div className="soho-footer-block">
              <h3>Elérhetőségek</h3>
              <a href="mailto:info@sohomiskolc.hu">
                <MailIcon />
                <span>info@sohomiskolc.hu</span>
              </a>
            </div>
          </div>
        </div>

        <div className="soho-footer-copy">© 2026 Soho Miskolc - Minden jog fenntartva.</div>
      </footer>
    </main>
  );
}
