"use client";

import { useState } from "react";

const navItems = [
  { label: "Über mich", href: "#about" },
  { label: "Projekte", href: "#projects" },
  { label: "Kontakt", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-[#0F1115]/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        <a
          href="#"
          className="text-sm font-semibold tracking-[0.25em] text-white"
        >
          VIKTOR HERTFELDER
        </a>

        <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Navigation öffnen"
          aria-expanded={isOpen}
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
          </span>
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-white/10 bg-[#0F1115] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm text-zinc-300">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
