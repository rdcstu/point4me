"use client";

import { useState } from "react";
import { MenuIcon, CloseIcon } from "./Icons";
import { AuthButtons } from "./AuthButtons";

const links = [
  { href: "#deals", label: "Deals" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="lg:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="p-2 text-white/90 hover:text-sun-400 transition-colors"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel — inside a screen-sized frame that clips it, so the
          closed (off-screen) panel never makes the page scroll sideways */}
      <div className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-hidden pointer-events-none" aria-hidden={!isOpen}>
      <div
        id="mobile-menu"
        className={`pointer-events-auto absolute top-0 right-0 w-64 h-full bg-white border-l border-ink-100 transform transition-[transform,visibility] duration-300 ease-in-out ${
          isOpen ? "translate-x-0 visible" : "translate-x-full invisible"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <nav className="flex flex-col p-6 space-y-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={closeMenu}
              className="text-base font-semibold text-ink-700 hover:text-sun-600 transition-colors py-2"
            >
              {l.label}
            </a>
          ))}
          <AuthButtons variant="mobile" onNavigate={closeMenu} />
        </nav>
      </div>
      </div>
    </div>
  );
}
