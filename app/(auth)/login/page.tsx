"use client";

import { auth } from "../../../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      window.location.href = "/";
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        {/* Logo / Title */}
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Qur’an Memoriser
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {mode === "login"
              ? "Log in to continue your memorisation journey."
              : "Start tracking and practising your memorisation with ease."}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-emerald-100 bg-white/90 shadow-xl shadow-emerald-100/40 backdrop-blur">
          {/* Mode toggle */}
          <div className="flex items-center justify-center gap-2 border-b border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                mode === "signup"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 px-6 py-6">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </div>

            {err && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-100">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? mode === "login"
                  ? "Logging in..."
                  : "Creating account..."
                : mode === "login"
                ? "Log in"
                : "Sign up"}
            </button>

            <p className="pt-2 text-center text-xs text-slate-500">
              Tip: use the same email on all your devices to sync your
              memorisation.
            </p>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-[11px] text-slate-500">
          “And We have certainly made the Qur’an easy for remembrance, so is
          there any who will remember?” <span className="italic">[54:17]</span>
        </p>
      </div>
    </main>
  );
}
