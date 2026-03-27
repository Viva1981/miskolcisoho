"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const menuItems = [
  { href: "/", label: "Főoldal" },
  { href: "/#esemenyek", label: "Események" },
  { href: "/galeria", label: "Galéria" },
  { href: "/kapcsolat", label: "Kapcsolat" },
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 6h16M4 12h16M4 18h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-6.84H7.96V12H10V9.8c0-2.02 1.2-3.14 3.04-3.14.88 0 1.8.16 1.8.16v1.98h-1.02c-1 0-1.32.62-1.32 1.26V12h2.24l-.36 2.96H12.5v6.84c4.56-.93 8-4.96 8-9.8 0-5.52-4.48-10-10-10Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2.2A1.8 1.8 0 0 0 5.2 7v10A1.8 1.8 0 0 0 7 18.8h10a1.8 1.8 0 0 0 1.8-1.8V7A1.8 1.8 0 0 0 17 5.2H7Zm10.3 1.65a.95.95 0 1 1 0 1.9.95.95 0 0 1 0-1.9ZM12 7.4A4.6 4.6 0 1 1 7.4 12 4.6 4.6 0 0 1 12 7.4Zm0 2.2A2.4 2.4 0 1 0 14.4 12 2.4 2.4 0 0 0 12 9.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SohoHeader() {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className={`soho-header ${isOpen ? "is-open" : ""}`}>
      <div className="soho-header-logo">
        <Link href="/" aria-label="SOHO Miskolc" onClick={closeMenu}>
          <Image
            src="/branding/soho_logo.png"
            alt="SOHO Miskolc"
            width={240}
            height={96}
            className="soho-logo-image"
            priority
          />
        </Link>
      </div>

      <nav className="soho-header-nav" aria-label="Soho navigáció">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="soho-header-socials" aria-label="Soho közösségi linkek">
        <a
          href="https://www.facebook.com/profile.php?id=61575425759586&locale=hu_HU"
          target="_blank"
          rel="noreferrer"
          aria-label="Soho Facebook"
        >
          <FacebookIcon />
        </a>
        <a href="#" aria-label="Soho Instagram">
          <InstagramIcon />
        </a>
      </div>

      <button
        type="button"
        className="soho-mobile-toggle"
        aria-label={isOpen ? "Menü bezárása" : "Menü megnyitása"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div className={`soho-mobile-menu ${isOpen ? "is-open" : ""}`}>
        <nav className="soho-mobile-nav" aria-label="Soho mobil navigáció">
          {menuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={index === 0 ? "is-active" : ""}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
