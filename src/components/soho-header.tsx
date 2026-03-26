"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const menuItems = [
  { href: "#fooldal", label: "Fooldal" },
  { href: "#esemenyek", label: "Esemenyek" },
  { href: "#facebook", label: "Facebook" },
];

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

      <nav className="soho-header-nav" aria-label="Soho navigacio">
        {menuItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="soho-header-socials">
        <a
          href="https://www.facebook.com/profile.php?id=61575425759586&locale=hu_HU"
          target="_blank"
          rel="noreferrer"
          aria-label="Soho Facebook"
        >
          <FacebookIcon />
        </a>
      </div>

      <button
        type="button"
        className="soho-mobile-toggle"
        aria-label={isOpen ? "Menu bezarasa" : "Menu megnyitasa"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div className={`soho-mobile-menu ${isOpen ? "is-open" : ""}`}>
        <nav className="soho-mobile-nav" aria-label="Soho mobil navigacio">
          {menuItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={index === 0 ? "is-active" : ""}
              onClick={closeMenu}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
