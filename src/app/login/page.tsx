'use client';
import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/projects');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">Debales AI</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-[#9999b3] mt-1">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#9999b3] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-[#555570] text-sm focus:border-indigo-500 focus:bg-white/8 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9999b3] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-[#555570] text-sm focus:border-indigo-500 transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <p className="text-xs text-[#555570] mb-3 text-center font-medium uppercase tracking-wider">Demo accounts</p>
            <div className="grid grid-cols-1 gap-2 text-xs text-[#9999b3] font-mono">
              {[
                { email: 'admin@acme.com', role: 'Admin — Acme Corp' },
                { email: 'member@acme.com', role: 'Member — Acme Corp' },
                { email: 'admin@techstart.com', role: 'Admin — TechStart' },
              ].map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword('password123'); }}
                  className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/3 hover:bg-white/6 border border-white/5 transition-colors cursor-pointer text-left"
                >
                  <span className="text-indigo-400">{u.email}</span>
                  <span className="text-[#555570]">{u.role}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-[#555570] text-center mt-2">Password: <span className="font-mono text-[#9999b3]">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
