'use client';

import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function SiteNav() {
  const [user] = useAuthState(auth);

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-semibold text-green-700">
          Qur’an Memoriser
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/surahs" className="rounded px-3 py-1 hover:bg-gray-100">Surahs</Link>
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-gray-600">{user.email}</span>
              <button
                onClick={() => signOut(auth)}
                className="rounded bg-gray-900 px-3 py-1 text-white hover:bg-gray-800"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
            >
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
