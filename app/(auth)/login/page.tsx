'use client';

import { auth } from '../../../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';

export default function LoginPage() {
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      window.location.href = '/';
    } catch (e: any) {
      setErr(e.message ?? 'Something went wrong');
    }
  };

  return (
    <main className="mx-auto max-w-sm space-y-4 p-6">
      <h1 className="text-center text-2xl font-semibold">
        {mode === 'login' ? 'Log in' : 'Create account'}
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full rounded border p-2"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="w-full rounded bg-black p-2 text-white">
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <button
        className="text-sm underline"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
      >
        {mode === 'login' ? 'No account? Sign up' : 'Already have an account? Log in'}
      </button>
    </main>
  );
}
