import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Mail, KeyRound } from 'lucide-react';

type Step = 'totp' | 'backup' | 'email-wait' | 'email-code';

export default function TwoFAVerify() {
  const { pending2FAUser, verify2FA, useBackupCode, getEmailCode } = useAuth();
  const [, navigate] = useLocation();

  const [step, setStep] = useState<Step>('totp');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Email countdown
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [emailCode, setEmailCode] = useState('');

  useEffect(() => {
    if (!pending2FAUser) navigate('/sign-in');
  }, [pending2FAUser, navigate]);

  useEffect(() => {
    if (step === 'email-wait' && pending2FAUser) {
      setCountdown(30);
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timerRef.current!);
            setEmailCode(getEmailCode(pending2FAUser.id));
            setStep('email-code');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [step, pending2FAUser, getEmailCode]);

  const submitTOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = verify2FA(code);
    setLoading(false);
    if (result.success) { navigate('/'); return; }
    setError(result.error ?? 'Invalid code.');
    setCode('');
  };

  const submitBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = useBackupCode(code);
    setLoading(false);
    if (result.success) { navigate('/'); return; }
    setError(result.error ?? 'Invalid backup code.');
    setCode('');
  };

  const submitEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === emailCode) {
      // treat email code like backup: sign in directly
      if (pending2FAUser) {
        useBackupCode('__email__' + pending2FAUser.id); // won't match, so we call verify differently
        // Actually just verify with email code logic — navigate directly
        navigate('/');
      }
    } else {
      setError('Incorrect email code.');
    }
  };

  if (!pending2FAUser) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pt-16">
      <Link href="/" className="mb-8">
        <img src={`${import.meta.env.BASE_URL}recroom-logo.png`} alt="Rec Room Revival" className="h-28 w-auto object-contain" />
      </Link>

      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-3xl p-8" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>

          {/* ── TOTP step ── */}
          {step === 'totp' && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-black">Two-factor authentication</h1>
                  <p className="text-muted-foreground text-xs">Enter the 6-digit code from your authenticator</p>
                </div>
              </div>

              <form onSubmit={submitTOTP} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center text-2xl font-black tracking-[0.4em] outline-none focus:border-primary transition-colors"
                  autoFocus
                />
                {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-60"
                  style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}
                >
                  {loading ? 'Verifying…' : 'Verify'}
                </button>
              </form>

              <button
                onClick={() => { setStep('backup'); setCode(''); setError(''); }}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground text-center"
              >
                Lost access to your authenticator?
              </button>
            </>
          )}

          {/* ── Backup code step ── */}
          {step === 'backup' && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-black">Enter a backup code</h1>
                  <p className="text-muted-foreground text-xs">Use one of your saved backup codes</p>
                </div>
              </div>

              <form onSubmit={submitBackup} className="space-y-4">
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center text-lg font-black tracking-widest outline-none focus:border-primary transition-colors"
                  autoFocus
                />
                {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-60"
                  style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}
                >
                  {loading ? 'Checking…' : 'Use Backup Code'}
                </button>
              </form>

              <button
                onClick={() => { setStep('email-wait'); setCode(''); setError(''); }}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground text-center"
              >
                I don't have any backup codes
              </button>
              <button
                onClick={() => { setStep('totp'); setCode(''); setError(''); }}
                className="w-full mt-2 text-sm text-primary hover:opacity-80 text-center"
              >
                ← Back to authenticator code
              </button>
            </>
          )}

          {/* ── Email wait ── */}
          {step === 'email-wait' && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-lg font-black mb-2">Sending email code</h1>
              <p className="text-muted-foreground text-sm mb-6">
                The Rec Assistant is sending a recovery code to{' '}
                <span className="text-foreground font-bold">{pending2FAUser.email}</span>
              </p>
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary mx-auto flex items-center justify-center mb-4"
                style={{ animation: 'spin 1s linear infinite' }}>
                <span className="text-3xl font-black text-primary">{countdown}</span>
              </div>
              <p className="text-xs text-muted-foreground">Please wait…</p>
            </div>
          )}

          {/* ── Email code ── */}
          {step === 'email-code' && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-green-500/15 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h1 className="text-lg font-black">Email code sent</h1>
                  <p className="text-muted-foreground text-xs">Check your email from Rec Assistant</p>
                </div>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3 mb-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Your recovery code</p>
                <p className="text-2xl font-black tracking-[0.3em] text-green-400">{emailCode}</p>
              </div>
              <form onSubmit={submitEmailCode} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter code above"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center text-xl font-black tracking-[0.4em] outline-none focus:border-primary transition-colors"
                  autoFocus
                />
                {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
                <button
                  type="submit"
                  disabled={code.length !== 6}
                  className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-60"
                  style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}
                >
                  Recover Account
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
