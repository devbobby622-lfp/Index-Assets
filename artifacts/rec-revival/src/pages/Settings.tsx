import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { usePrefs } from '@/context/PrefsContext';
import { useNotify } from '@/context/NotificationContext';
import { useMusic } from '@/context/MusicContext';
import { QRCodeSVG } from 'qrcode.react';
import * as OTPAuth from 'otpauth';
import albumArt from '@assets/Screenshot_2026-07-20_202358_1784593492069.png';
import Avatar from '@/components/Avatar';
import {
  ShieldCheck, ShieldOff, KeyRound, Eye, EyeOff, Trash2, LogOut,
  Save, Copy, Check, Moon, Sun, Bell, Globe, ShieldAlert, User, Lock,
  Sparkles, Camera, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward,
  Bot, Layers
} from 'lucide-react';

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-40 ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

// ── Section / Row ─────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden mb-4" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-black text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border last:border-0">{children}</div>;
}

// ── Format seconds → mm:ss ────────────────────────────────────────────────────
function fmt(s: number) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ── Mini MP3 Player ────────────────────────────────────────────────────────────
function MiniPlayer() {
  const { isMuted, isPlaying, volume, currentTime, duration, toggleMute, setVolume, seek, play, pause } = useMusic();
  const [showVolume, setShowVolume] = useState(false);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => seek(Number(e.target.value));
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => setVolume(Number(e.target.value));
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="px-6 py-5">
      {/* Track info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 overflow-hidden flex-shrink-0">
          <img src={albumArt} alt="Album art" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm truncate">OOBE Theme</p>
          <p className="text-xs text-muted-foreground">Rec Room Revival · Background Music</p>
        </div>
        <button
          onClick={() => setShowVolume(v => !v)}
          className={`p-2 rounded-xl border transition-colors ${showVolume ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
        >
          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Volume slider */}
      {showVolume && (
        <div className="flex items-center gap-3 mb-4">
          <VolumeX className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume}
            onChange={handleVolume} className="flex-1 h-1.5 rounded-full accent-primary" style={{ accentColor: 'hsl(var(--primary))' }} />
          <Volume2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <input type="range" min={0} max={duration || 0} step={0.5} value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 rounded-full accent-primary"
          style={{ accentColor: 'hsl(var(--primary))', background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--border)) ${pct}%)` }} />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">{fmt(currentTime)}</span>
          <span className="text-[10px] text-muted-foreground">{fmt(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => seek(Math.max(0, currentTime - 10))} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="-10s">
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={isPlaying && !isMuted ? pause : play}
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity"
          style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.35)' }}
        >
          {isPlaying && !isMuted
            ? <Pause className="w-5 h-5 text-white" fill="white" />
            : <Play className="w-5 h-5 text-white" fill="white" />
          }
        </button>
        <button onClick={() => seek(Math.min(duration, currentTime + 10))} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="+10s">
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Mute note */}
      {isMuted && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          Press <button onClick={toggleMute} className="text-primary font-bold hover:underline">unmute</button> or hit Play to start
        </p>
      )}
    </div>
  );
}

// ── 2FA Setup modal (QR code) ──────────────────────────────────────────────────
function TwoFASetupModal({ onClose }: { onClose: () => void }) {
  const { currentUser, enable2FA, confirm2FAEnable, getTOTPCode } = useAuth();
  const [step, setStep] = useState<'show' | 'verify' | 'codes'>('show');
  const [setupData] = useState(() => enable2FA());
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [currentTOTP, setCurrentTOTP] = useState(() => getTOTPCode(setupData.seed));

  // Build a standard otpauth URI compatible with Google Authenticator / Authy
  const otpauthUri = new OTPAuth.TOTP({
    issuer: 'RecRoomRevival',
    label: currentUser?.username ?? 'User',
    secret: OTPAuth.Secret.fromBase32(setupData.seed),
    digits: 6,
    period: 30,
    algorithm: 'SHA1',
  }).toString();

  useEffect(() => {
    const id = setInterval(() => setCurrentTOTP(getTOTPCode(setupData.seed)), 1000);
    return () => clearInterval(id);
  }, [setupData.seed, getTOTPCode]);

  const verify = () => {
    const result = confirm2FAEnable(setupData.seed, setupData.backupCodes, code);
    if (result.success) setStep('codes');
    else { setError(result.error ?? 'Invalid code.'); }
  };

  const copyCode = (idx: number, val: string) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopied(idx); setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
        {step === 'show' && (
          <>
            <h3 className="font-black text-lg mb-1">Set up 2FA</h3>
            <p className="text-sm text-muted-foreground mb-5">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>

            {/* QR code */}
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-2xl p-4 inline-block">
                <QRCodeSVG value={otpauthUri} size={180} level="M" />
              </div>
            </div>

            {/* Current code preview */}
            <div className="bg-primary/10 border border-primary/25 rounded-2xl px-4 py-3 mb-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Current code (refreshes every 30s)</p>
              <p className="text-3xl font-black tracking-[0.3em] text-primary">{currentTOTP}</p>
            </div>

            {/* Fallback: show seed */}
            <details className="mb-5">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground select-none">Can't scan? Show manual key</summary>
              <div className="bg-background border border-border rounded-xl px-4 py-3 mt-2">
                <p className="text-xs text-muted-foreground mb-1">Secret key</p>
                <p className="font-mono text-sm font-bold break-all">{setupData.seed}</p>
              </div>
            </details>

            <button onClick={() => setStep('verify')} className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90 mb-2" style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}>
              I've scanned the QR code → Continue
            </button>
            <button onClick={onClose} className="w-full text-sm text-muted-foreground py-2">Cancel</button>
          </>
        )}
        {step === 'verify' && (
          <>
            <h3 className="font-black text-lg mb-2">Verify your code</h3>
            <div className="bg-primary/10 border border-primary/25 rounded-2xl px-4 py-2 mb-4 text-center">
              <p className="text-xs text-muted-foreground">Current code</p>
              <p className="text-2xl font-black tracking-[0.3em] text-primary">{currentTOTP}</p>
            </div>
            <input type="text" inputMode="numeric" maxLength={6} value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
              placeholder="000000" autoFocus
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center text-2xl font-black tracking-[0.4em] outline-none focus:border-primary transition-colors mb-3" />
            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">{error}</p>}
            <button onClick={verify} disabled={code.length !== 6} className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-60 mb-2" style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}>
              Confirm
            </button>
            <button onClick={() => setStep('show')} className="w-full text-sm text-primary py-2">← Back</button>
          </>
        )}
        {step === 'codes' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-green-400" />
              <h3 className="font-black text-lg text-green-400">2FA enabled!</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Save these backup codes — each can only be used once.</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {setupData.backupCodes.map((c, i) => (
                <button key={i} onClick={() => copyCode(i, c)} className="flex items-center justify-between bg-background border border-border rounded-xl px-3 py-2 font-mono text-sm font-bold hover:border-primary/50 transition-colors">
                  <span>{c}</span>
                  {copied === i ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90" style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}>
              Done — I've saved my codes
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Delete auth modal ─────────────────────────────────────────────────────────
function DeleteAuthModal({ onClose }: { onClose: () => void }) {
  const { currentUser, disable2FA, getEmailCode } = useAuth();
  const [step, setStep] = useState<'backup' | 'email-wait' | 'email-code'>('backup');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [emailCode, setEmailCode] = useState('');

  useEffect(() => {
    if (step !== 'email-wait' || !currentUser) return;
    setCountdown(30);
    const id = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(id); setEmailCode(getEmailCode(currentUser.id)); setStep('email-code'); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step, currentUser, getEmailCode]);

  const submitBackup = () => {
    if (!currentUser) return;
    const valid = currentUser.backupCodes.some(c => c.toUpperCase() === code.toUpperCase().trim());
    if (!valid) { setError('Invalid backup code.'); return; }
    disable2FA(); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-6" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
        {step === 'backup' && (
          <>
            <h3 className="font-black text-lg mb-2">Delete authentication code</h3>
            <p className="text-sm text-muted-foreground mb-4">Enter a backup code to confirm, then 2FA will be removed.</p>
            <input type="text" value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }} placeholder="XXXX-XXXX" autoFocus
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center font-mono font-black tracking-widest outline-none focus:border-primary transition-colors mb-3" />
            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">{error}</p>}
            <button onClick={submitBackup} disabled={!code.trim()} className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-60 mb-2" style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}>
              Remove 2FA
            </button>
            <button onClick={() => setStep('email-wait')} className="w-full text-sm text-muted-foreground hover:text-foreground py-2 text-center">I don't have backup codes</button>
            <button onClick={onClose} className="w-full text-sm text-muted-foreground py-2 text-center">Cancel</button>
          </>
        )}
        {step === 'email-wait' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary mx-auto flex items-center justify-center mb-4" style={{ animation: 'spin 1s linear infinite' }}>
              <span className="text-3xl font-black text-primary">{countdown}</span>
            </div>
            <h3 className="font-black text-lg mb-2">Sending email code…</h3>
            <p className="text-sm text-muted-foreground">Contacting <span className="text-foreground font-bold">{currentUser?.email}</span></p>
          </div>
        )}
        {step === 'email-code' && (
          <>
            <h3 className="font-black text-lg mb-2">Email code sent</h3>
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3 mb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Your recovery code</p>
              <p className="text-2xl font-black tracking-[0.3em] text-green-400">{emailCode}</p>
            </div>
            <input type="text" inputMode="numeric" maxLength={6} value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }} placeholder="000000"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center text-xl font-black tracking-[0.4em] outline-none focus:border-primary transition-colors mb-3" />
            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">{error}</p>}
            <button onClick={() => { if (code.trim() === emailCode) { disable2FA(); onClose(); } else setError('Incorrect code.'); }}
              disabled={code.length !== 6} className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-60" style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}>
              Remove 2FA
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main Settings ─────────────────────────────────────────────────────────────
export default function Settings() {
  const { currentUser, updateUser, deleteAccount, signOut, claimAdmin } = useAuth();
  const { prefs, setPrefs } = usePrefs();
  const notify = useNotify();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(currentUser?.username ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [notifications, setNotifications] = useState(true);
  const [communityPosts, setCommunityPosts] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showDeleteAuth, setShowDeleteAuth] = useState(false);

  const [adminCode, setAdminCode] = useState('');
  const [adminMsg, setAdminMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { document.documentElement.className = theme === 'dark' ? 'theme-dark' : 'theme-light'; }, [theme]);
  useEffect(() => {
    if (currentUser) { setUsername(currentUser.username); setEmail(currentUser.email); setBio(currentUser.bio); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // ── Profile picture ────────────────────────────────────────────────────────
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      updateUser({ profileImage: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      updateUser({ bannerImage: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearAvatar = () => updateUser({ profileImage: '' });
  const clearBanner = () => updateUser({ bannerImage: '' });

  const handleSave = useCallback(() => {
    setSaveError('');
    if (!username.trim()) { setSaveError('Username cannot be empty.'); return; }
    if (newPass && newPass !== confirmPass) { setSaveError('Passwords do not match.'); return; }
    if (newPass && newPass.length < 6) { setSaveError('Password must be at least 6 characters.'); return; }
    const updates: Parameters<typeof updateUser>[0] = { username: username.trim(), email: email.trim(), bio };
    if (newPass) updates.password = newPass;
    updateUser(updates);
    setNewPass(''); setConfirmPass('');
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  }, [username, email, bio, newPass, confirmPass, updateUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 pt-16">
        <p className="text-muted-foreground">You need to be signed in to view settings.</p>
        <button onClick={() => navigate('/sign-in')} className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:opacity-90" style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}>
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      {show2FASetup && <TwoFASetupModal onClose={() => setShow2FASetup(false)} />}
      {showDeleteAuth && <DeleteAuthModal onClose={() => setShowDeleteAuth(false)} />}

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <input ref={bannerInputRef} type="file" accept="image/*,.gif" className="hidden" onChange={handleBannerChange} />

      <div className="max-w-2xl mx-auto px-6 py-14">
        {/* Header with clickable avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar user={currentUser} size="xl" showOnline />
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black">{currentUser.username}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {currentUser.isAdmin && <span className="text-xs text-primary font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Admin</span>}
              {currentUser.role !== 'user' && <span className="text-xs text-blue-400 font-bold capitalize">{currentUser.role}</span>}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <button onClick={handleAvatarClick} className="text-xs text-primary hover:underline font-bold">Change photo</button>
              {currentUser.profileImage && (
                <>
                  <span className="text-muted-foreground text-xs">·</span>
                  <button onClick={clearAvatar} className="text-xs text-muted-foreground hover:text-red-400 transition-colors">Remove</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Profile ── */}
        <Section title="Profile">
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={300} placeholder="Tell the community a little about yourself…" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors resize-none" />
              <p className="text-xs text-muted-foreground mt-1 text-right">{bio.length}/300</p>
            </div>

            {/* Banner image */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Profile Banner</label>
              {currentUser.bannerImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-border mb-2 h-28">
                  <img src={currentUser.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <button type="button" onClick={() => bannerInputRef.current?.click()} className="text-xs bg-black/50 text-white px-2.5 py-1 rounded-lg font-bold hover:bg-black/70 backdrop-blur-sm">Change</button>
                    <button type="button" onClick={clearBanner} className="text-xs bg-red-500/70 text-white px-2.5 py-1 rounded-lg font-bold hover:bg-red-500/90 backdrop-blur-sm">Remove</button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="w-full h-20 border border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors text-sm font-bold"
                >
                  <Camera className="w-4 h-4" /> Upload Banner Image
                </button>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">Shown on your public profile in the Players tab.</p>
            </div>
          </div>
        </Section>

        {/* ── Password ── */}
        <Section title="Change Password">
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> New Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Leave blank to keep current"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-10 text-sm font-medium outline-none focus:border-primary transition-colors" />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {newPass && (
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Confirm New Password</label>
                <input type={showPass ? 'text' : 'password'} value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors" />
              </div>
            )}
          </div>
        </Section>

        {/* Save */}
        <div className="mb-4">
          {saveError && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-3">{saveError}</p>}
          <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-2xl font-black hover:opacity-90 transition-opacity" style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}>
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>

        {/* ── Extras ── */}
        <Section title="Extras">
          <MiniPlayer />

          {/* RecBuild Assistant toggle */}
          <Row>
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-primary" />
              <div>
                <p className="font-bold text-sm">RecBuild Assistant</p>
                <p className="text-xs text-muted-foreground">Floating chat bot (disabled by default)</p>
              </div>
            </div>
            <Toggle checked={prefs.assistantEnabled} onChange={v => { setPrefs({ assistantEnabled: v }); notify(v ? 'Assistant enabled — chat icon will appear' : 'Assistant disabled', 'info'); }} />
          </Row>

          {/* UI Transparency toggle */}
          <Row>
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-primary" />
              <div>
                <p className="font-bold text-sm">UI Transparency</p>
                <p className="text-xs text-muted-foreground">Make panels semi-transparent (disabled by default)</p>
              </div>
            </div>
            <Toggle checked={prefs.uiTransparencyEnabled} onChange={v => { setPrefs({ uiTransparencyEnabled: v }); notify(v ? 'Transparency enabled — adjust the slider below' : 'Transparency disabled', 'info'); }} />
          </Row>

          {prefs.uiTransparencyEnabled && (
            <div className="px-6 py-4 border-b border-border last:border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground">Transparency level</span>
                <span className="text-xs font-black text-primary">{Math.round(prefs.uiTransparency * 100)}%</span>
              </div>
              <input
                type="range" min={0} max={0.85} step={0.05}
                value={prefs.uiTransparency}
                onChange={e => setPrefs({ uiTransparency: Number(e.target.value) })}
                className="w-full h-1.5 rounded-full"
                style={{ accentColor: 'hsl(var(--primary))' }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">Subtle</span>
                <span className="text-[10px] text-muted-foreground">Very transparent</span>
              </div>
            </div>
          )}
        </Section>

        {/* ── Appearance ── */}
        <Section title="Appearance">
          <Row>
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              <div>
                <p className="font-bold text-sm">Theme</p>
                <p className="text-xs text-muted-foreground">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
              </div>
            </div>
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="text-xs font-bold bg-muted border border-border px-3 py-1.5 rounded-full hover:border-primary/50 transition-colors">
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </Row>

          {/* Bloom toggle + slider */}
          <Row>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <p className="font-bold text-sm">Text Bloom</p>
                <p className="text-xs text-muted-foreground">Glow effect on headings</p>
              </div>
            </div>
            <Toggle checked={prefs.bloomEnabled} onChange={v => { setPrefs({ bloomEnabled: v }); notify(v ? 'Bloom effect enabled' : 'Bloom effect disabled', 'info'); }} />
          </Row>

          {prefs.bloomEnabled && (
            <div className="px-6 py-4 border-b border-border last:border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground">Bloom intensity</span>
                <span className="text-xs font-black text-primary">{Math.round(prefs.bloomIntensity * 100)}%</span>
              </div>
              <input type="range" min={0} max={1} step={0.05} value={prefs.bloomIntensity}
                onChange={e => setPrefs({ bloomIntensity: Number(e.target.value) })}
                className="w-full accent-primary h-1.5 rounded-full" style={{ accentColor: 'hsl(var(--primary))' }} />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">Subtle</span>
                <span className="text-[10px] text-muted-foreground">Intense</span>
              </div>
            </div>
          )}
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notifications">
          <Row>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <p className="font-bold text-sm">Server announcements</p>
                <p className="text-xs text-muted-foreground">Get notified about maintenance and events</p>
              </div>
            </div>
            <Toggle checked={notifications} onChange={setNotifications} />
          </Row>
          <Row>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <div>
                <p className="font-bold text-sm">Community posts</p>
                <p className="text-xs text-muted-foreground">Notify me of new posts</p>
              </div>
            </div>
            <Toggle checked={communityPosts} onChange={setCommunityPosts} />
          </Row>
        </Section>

        {/* ── 2FA ── */}
        <Section title="Two-Factor Authentication">
          {currentUser.has2FA ? (
            <>
              <Row>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div><p className="font-bold text-sm">2FA is enabled</p><p className="text-xs text-muted-foreground">Your account is protected</p></div>
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">Active</span>
              </Row>
              <Row>
                <div><p className="font-bold text-sm">Backup codes remaining</p><p className="text-xs text-muted-foreground">{currentUser.backupCodes.length} of 8</p></div>
                <span className="font-black text-lg text-primary">{currentUser.backupCodes.length}</span>
              </Row>
              <div className="px-6 py-4 flex gap-3">
                <button onClick={() => setShowDeleteAuth(true)} className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border rounded-xl py-2.5 text-sm font-bold hover:border-red-500/40 hover:text-red-400 transition-colors">
                  <KeyRound className="w-4 h-4" /> Delete Auth Code
                </button>
                <button onClick={() => setShowDeleteAuth(true)} className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border rounded-xl py-2.5 text-sm font-bold hover:border-red-500/40 hover:text-red-400 transition-colors">
                  <ShieldOff className="w-4 h-4" /> Disable 2FA
                </button>
              </div>
            </>
          ) : (
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-3">
                <ShieldAlert className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div><p className="font-bold text-sm">2FA is not enabled</p><p className="text-xs text-muted-foreground">Add an extra layer of security</p></div>
              </div>
              <button onClick={() => setShow2FASetup(true)} className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90" style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}>
                Enable Two-Factor Authentication
              </button>
            </div>
          )}
        </Section>

        {/* ── Account Info ── */}
        <Section title="Account Info">
          <Row><span className="text-sm text-muted-foreground">Username</span><span className="font-bold text-sm">{currentUser.username}</span></Row>
          <Row><span className="text-sm text-muted-foreground">Email</span><span className="font-bold text-sm">{currentUser.email}</span></Row>
          <Row><span className="text-sm text-muted-foreground">Password</span><span className="font-bold text-sm tracking-widest">{'•'.repeat(Math.min(currentUser.password.length, 10))}</span></Row>
          <Row><span className="text-sm text-muted-foreground">Role</span><span className="font-bold text-sm capitalize">{currentUser.role}</span></Row>
          <Row><span className="text-sm text-muted-foreground">2FA</span><span className={`font-bold text-sm ${currentUser.has2FA ? 'text-green-400' : 'text-muted-foreground'}`}>{currentUser.has2FA ? 'Enabled' : 'Disabled'}</span></Row>
        </Section>

        {/* ── Admin claim ── */}
        {!currentUser.isAdmin && (
          <Section title="Admin Access">
            <div className="px-6 py-5">
              <p className="text-xs text-muted-foreground mb-3">Enter the admin code to claim owner permissions.</p>
              <div className="flex gap-2">
                <input type="text" value={adminCode} onChange={e => setAdminCode(e.target.value)} placeholder="Admin code"
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-primary transition-colors" />
                <button onClick={() => { const ok = claimAdmin(adminCode); setAdminMsg(ok ? '✓ Granted!' : '✗ Invalid.'); setAdminCode(''); setTimeout(() => setAdminMsg(''), 3000); }}
                  className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:opacity-90" style={{ boxShadow: '0 4px 12px hsl(var(--primary)/0.3)' }}>
                  Claim
                </button>
              </div>
              {adminMsg && <p className={`text-sm mt-2 ${adminMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{adminMsg}</p>}
            </div>
          </Section>
        )}

        {/* ── Danger zone ── */}
        <Section title="Danger Zone">
          <div className="px-6 py-5 space-y-3">
            <button onClick={signOut} className="w-full flex items-center justify-center gap-2 bg-muted border border-border rounded-xl py-3 text-sm font-bold hover:border-red-500/40 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl py-3 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-colors">
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                <p className="text-sm text-red-400 font-bold mb-3">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-muted">Cancel</button>
                  <button onClick={() => { deleteAccount(); navigate('/'); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-black hover:opacity-90">Delete</button>
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
