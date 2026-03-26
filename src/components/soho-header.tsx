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
