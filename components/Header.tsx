"use client";

import Link from "next/link";
import { useState } from "react";

const nav = [
  { href: "/", label: "Home" },
{ href: "/surahs", label: "Surahs" },
  { href: "/practice", label: "Practice" },
  { href: "/stats", label: "Progress" },
];

export default function Header({ userEmail }: { userEmail?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-7xl px-4">
        <div
          className="
            mt-3 flex h-14 items-center justify-between
            rounded-2xl border border-white/30 bg-white/50
            backdrop-blur-xl shadow-md px-4 sm:px-6
          "
        >
          {/* Brand */}
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight bg-gradient-to-r from-emerald-600 to-fuchsia-600 bg-clip-text text-transparent hover:opacity-90"
          >
            Qur’an Memoriser
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-emerald-700 transition">
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="hidden md:flex items-center gap-3">
            {userEmail && <span className="text-sm text-gray-700">{userEmail}</span>}
            <button className="rounded-xl bg-gray-900 text-white text-sm font-medium px-4 py-2 shadow hover:bg-black transition">
              {userEmail ? "Log out" : "Log in"}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="md:hidden grid place-items-center w-10 h-10 rounded-xl border border-gray-300 bg-white/70 backdrop-blur hover:bg-white"
          >
            {/* Icon toggles to X */}
            <div className="relative w-5 h-5">
              <span
                className={`absolute left-0 top-1 block h-[2px] w-full bg-gray-900 transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`absolute left-0 top-2.5 block h-[2px] w-full bg-gray-900 transition-opacity ${open ? "opacity-0" : "opacity-100"}`}
              />
              <span
                className={`absolute left-0 top-4 block h-[2px] w-full bg-gray-900 transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </div>
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden mt-2 overflow-hidden rounded-2xl border border-white/30 bg-white/80 backdrop-blur-xl shadow-md">
            <nav className="flex flex-col divide-y">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-gray-800 hover:bg-white"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center justify-between px-4 py-3">
              {userEmail ? (
                <>
                  <span className="text-sm text-gray-700">{userEmail}</span>
                  <button className="rounded-xl bg-gray-900 text-white text-sm font-medium px-4 py-2 shadow hover:bg-black transition">
                    Log out
                  </button>
                </>
              ) : (
                <button className="w-full rounded-xl bg-gray-900 text-white text-sm font-medium px-4 py-2 shadow hover:bg-black transition">
                  Log in
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
