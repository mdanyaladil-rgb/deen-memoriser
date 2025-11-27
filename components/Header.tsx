// components/Header.tsx
"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Header({ userEmail }: { userEmail: string | null }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 pointer-events-none">
      <div className="mx-auto max-w-6xl px-4 pt-3">
        <div className="pointer-events-auto flex items-center justify-between px-6 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-50 shadow-md border border-emerald-100">

          {/* ------------ Left: Brand Name ------------ */}
          <Link href="/" className="text-xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
              Deen
            </span>{" "}
            <span className="bg-gradient-to-r from-fuchsia-600 to-rose-500 bg-clip-text text-transparent">
              Memoriser
            </span>
          </Link>

          {/* ------------ Middle: Nav Links ------------ */}
          <nav className="flex gap-6 items-center text-gray-700 font-medium">
            <Link href="/">Home</Link>
            <Link href="/surahs">Surahs</Link>
            <Link href="/practice">Practice</Link>
            <Link href="/essentials">Essentials</Link>
            <Link href="/stats">Progress</Link>

            <Link
              href="/beta-disclaimer"
              className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200"
            >
              Beta
            </Link>
          </nav>

          {/* ------------ Right: Auth State ------------ */}
          {userEmail ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">{userEmail}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-emerald-700 font-medium hover:text-emerald-900"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
