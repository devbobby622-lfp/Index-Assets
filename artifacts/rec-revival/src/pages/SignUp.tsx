import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUp() {
  const { signUp } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = signUp(username, password, email);
    setLoading(false);
    if (!result.success) { setError(result.error ?? 'Something went wrong.'); return; }
    navigate('/sign-in');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pt-16">
      <Link href="/" className="mb-8">
        <img
          src={`${import.meta.env.BASE_URL}recroom-logo.png`}
          alt="Rec Room Revival"
          className="h-28 w-auto object-contain"
        />
      </Link>

      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-3xl p-8" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
          <h1 className="text-2xl font-black mb-1">Create account</h1>
          <p className="text-muted-foreground text-sm mb-6">Join Rec Room Revival</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Username</label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-10 text-sm font-medium outline-none focus:border-primary transition-colors"
                  placeholder="Min. 6 characters"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Confirm Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-primary font-bold hover:opacity-80">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
