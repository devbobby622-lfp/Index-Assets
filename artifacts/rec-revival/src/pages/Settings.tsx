import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck, ShieldOff, KeyRound, Eye, EyeOff, Trash2, LogOut,
  Save, Copy, Check, Moon, Sun, Bell, Globe, ShieldAlert, User, Lock
} from 'lucide-react';

// ── Toggle component (fixed) ──────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}
      />
    </button>
  );
}

// ── Section shell ─────────────────────────────────────────────────────────────
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

// ── 2FA Setup modal ───────────────────────────────────────────────────────────
function TwoFASetupModal({ onClose }: { onClose: () => void }) {
  const { enable2FA, confirm2FAEnable, getTOTPCode } = useAuth();
  const [step, setStep] = useState<'show' | 'verify' | 'codes'>('show');
  const [setupData] = useState(() => enable2FA());
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [currentTOTP, setCurrentTOTP] = useState(() => getTOTPCode(setupData.seed));

  // Refresh TOTP display every second
  useEffect(() => {
    const id = setInterval(() => setCurrentTOTP(getTOTPCode(setupData.seed)), 1000);
    return () => clearInterval(id);
  }, [setupData.seed, getTOTPCode]);

  const verify = () => {
    const result = confirm2FAEnable(setupData.seed, setupData.backupCodes, code);
    if (result.success) { setStep('codes'); }
    else { setError(result.error ?? 'Invalid code.'); }
  };

  const copyCode = (idx: number, val: string) => {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>

        {step === 'show' && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-black text-lg">Set up 2FA</h3>
                <p className="text-xs text-muted-foreground">Use an authenticator app</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Your authenticator app generates a 6-digit code every 30 seconds. Your current code for this seed is shown below — enter it to confirm setup.
            </p>

            <div className="bg-background border border-border rounded-2xl px-4 py-3 mb-4">
              <p className="text-xs text-muted-foreground mb-1">Seed (save this)</p>
              <p className="font-mono text-sm font-bold break-all">{setupData.seed}</p>
            </div>

            <div className="bg-primary/10 border border-primary/25 rounded-2xl px-4 py-3 mb-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">Current code (refreshes automatically)</p>
              <p className="text-3xl font-black tracking-[0.3em] text-primary">{currentTOTP}</p>
            </div>

            <button
              onClick={() => setStep('verify')}
              className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90"
              style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}
            >
              I've saved my seed → Continue
            </button>
            <button onClick={onClose} className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground py-2">Cancel</button>
          </>
        )}

        {step === 'verify' && (
          <>
            <h3 className="font-black text-lg mb-2">Verify your code</h3>
            <p className="text-sm text-muted-foreground mb-4">Enter the current 6-digit code to confirm 2FA is working.</p>
            <div className="bg-primary/10 border border-primary/25 rounded-2xl px-4 py-2 mb-4 text-center">
              <p className="text-xs text-muted-foreground">Current code</p>
              <p className="text-2xl font-black tracking-[0.3em] text-primary">{currentTOTP}</p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
              placeholder="000000"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center text-2xl font-black tracking-[0.4em] outline-none focus:border-primary transition-colors mb-3"
              autoFocus
            />
            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">{error}</p>}
            <button onClick={verify} disabled={code.length !== 6} className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-60" style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}>
              Confirm
            </button>
            <button onClick={() => setStep('show')} className="w-full mt-2 text-sm text-primary hover:opacity-80 py-2">← Back</button>
          </>
        )}

        {step === 'codes' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-black text-lg text-green-400">2FA enabled!</h3>
                <p className="text-xs text-muted-foreground">Save your backup codes now</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">These are your one-time backup codes. Each can only be used once. Store them somewhere safe.</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {setupData.backupCodes.map((c, i) => (
                <button
                  key={i}
                  onClick={() => copyCode(i, c)}
                  className="flex items-center justify-between bg-background border border-border rounded-xl px-3 py-2 font-mono text-sm font-bold hover:border-primary/50 transition-colors"
                >
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

// ── Delete auth code modal ────────────────────────────────────────────────────
function DeleteAuthModal({ onClose }: { onClose: () => void }) {
  const { currentUser, disable2FA, getEmailCode } = useAuth();
  const [step, setStep] = useState<'backup' | 'email-wait' | 'email-code' | 'done'>('backup');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [emailCode, setEmailCode] = useState('');

  useEffect(() => {
    if (step !== 'email-wait' || !currentUser) return;
    setCountdown(30);
    const id = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(id);
          setEmailCode(getEmailCode(currentUser.id));
          setStep('email-code');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step, currentUser, getEmailCode]);

  const submitBackup = () => {
    if (!currentUser) return;
    const valid = currentUser.backupCodes.some(c => c.toUpperCase() === code.toUpperCase().trim());
    if (!valid) { setError('Invalid backup code.'); return; }
    disable2FA();
    onClose();
  };

  const submitEmailCode = () => {
    if (code.trim() === emailCode) { disable2FA(); onClose(); }
    else setError('Incorrect code.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-6" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
        {step === 'backup' && (
          <>
            <h3 className="font-black text-lg mb-2">Delete authentication code</h3>
            <p className="text-sm text-muted-foreground mb-4">Enter a backup code to confirm you own this account, then 2FA will be removed.</p>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="XXXX-XXXX"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center font-mono font-black tracking-widest outline-none focus:border-primary transition-colors mb-3"
              autoFocus
            />
            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">{error}</p>}
            <button onClick={submitBackup} disabled={!code.trim()} className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-60 mb-2" style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}>
              Remove 2FA
            </button>
            {(!currentUser?.backupCodes.length) && (
              <button onClick={() => setStep('email-wait')} className="w-full text-sm text-muted-foreground hover:text-foreground py-2 text-center">
                I don't have any backup codes
              </button>
            )}
            <button onClick={onClose} className="w-full text-sm text-muted-foreground hover:text-foreground py-2 text-center">Cancel</button>
          </>
        )}

        {step === 'email-wait' && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <div className="text-3xl font-black text-primary">{countdown}</div>
            </div>
            <h3 className="font-black text-lg mb-2">Sending email code…</h3>
            <p className="text-sm text-muted-foreground">The Rec Assistant is sending a recovery code to <span className="text-foreground font-bold">{currentUser?.email}</span></p>
          </div>
        )}

        {step === 'email-code' && (
          <>
            <h3 className="font-black text-lg mb-2">Email code sent</h3>
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-3 mb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Your recovery code</p>
              <p className="text-2xl font-black tracking-[0.3em] text-green-400">{emailCode}</p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
              placeholder="000000"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center text-xl font-black tracking-[0.4em] outline-none focus:border-primary transition-colors mb-3"
            />
            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">{error}</p>}
            <button onClick={submitEmailCode} disabled={code.length !== 6} className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-60" style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}>
              Remove 2FA
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Settings page ────────────────────────────────────────────────────────
export default function Settings() {
  const { currentUser, updateUser, deleteAccount, signOut, claimAdmin } = useAuth();
  const [, navigate] = useLocation();

  // Profile fields
  const [username, setUsername] = useState(currentUser?.username ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Preferences
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // 2FA modals
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showDeleteAuth, setShowDeleteAuth] = useState(false);

  // Admin
  const [adminCode, setAdminCode] = useState('');
  const [adminMsg, setAdminMsg] = useState('');

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync theme to document
  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
  }, [theme]);

  // Sync if user changes (e.g. after save)
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username);
      setEmail(currentUser.email);
      setBio(currentUser.bio);
    }
  }, [currentUser?.id]);

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

  const handleSave = () => {
    setSaveError('');
    if (!username.trim()) { setSaveError('Username cannot be empty.'); return; }
    if (newPass && newPass !== confirmPass) { setSaveError('Passwords do not match.'); return; }
    if (newPass && newPass.length < 6) { setSaveError('Password must be at least 6 characters.'); return; }
    const updates: Parameters<typeof updateUser>[0] = { username: username.trim(), email: email.trim(), bio };
    if (newPass) updates.password = newPass;
    updateUser(updates);
    setNewPass(''); setConfirmPass('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClaimAdmin = () => {
    const ok = claimAdmin(adminCode);
    setAdminMsg(ok ? '✓ Admin access granted!' : '✗ Invalid code.');
    setAdminCode('');
    setTimeout(() => setAdminMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      {show2FASetup && <TwoFASetupModal onClose={() => setShow2FASetup(false)} />}
      {showDeleteAuth && <DeleteAuthModal onClose={() => setShowDeleteAuth(false)} />}

      <div className="max-w-2xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-lg">
              {currentUser.username[0].toUpperCase()}
            </span>
            <div>
              <h1 className="text-2xl font-black">{currentUser.username}</h1>
              {currentUser.isAdmin && (
                <div className="flex items-center gap-1 text-xs text-primary font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Profile ── */}
        <Section title="Profile">
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Username
              </label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="Tell the community a little about yourself…"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{bio.length}/300</p>
            </div>
          </div>
        </Section>

        {/* ── Password ── */}
        <Section title="Change Password">
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> New Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-10 text-sm font-medium outline-none focus:border-primary transition-colors"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {newPass && (
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Confirm New Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-colors"
                />
              </div>
            )}
          </div>
        </Section>

        {/* Save button */}
        <div className="mb-4">
          {saveError && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-3">{saveError}</p>}
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-2xl font-black hover:opacity-90 transition-opacity"
            style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>

        {/* ── 2FA ── */}
        <Section title="Two-Factor Authentication">
          {currentUser.has2FA ? (
            <>
              <Row>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">2FA is enabled</p>
                    <p className="text-xs text-muted-foreground">Your account is protected</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">Active</span>
              </Row>
              <Row>
                <div>
                  <p className="font-bold text-sm">Backup codes remaining</p>
                  <p className="text-xs text-muted-foreground">{currentUser.backupCodes.length} of 8 remaining</p>
                </div>
                <span className="font-black text-lg text-primary">{currentUser.backupCodes.length}</span>
              </Row>
              <div className="px-6 py-4 flex gap-3">
                <button
                  onClick={() => setShowDeleteAuth(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border rounded-xl py-2.5 text-sm font-bold hover:border-red-500/40 hover:text-red-400 transition-colors"
                >
                  <KeyRound className="w-4 h-4" /> Delete Auth Code
                </button>
                <button
                  onClick={() => setShowDeleteAuth(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border rounded-xl py-2.5 text-sm font-bold hover:border-red-500/40 hover:text-red-400 transition-colors"
                >
                  <ShieldOff className="w-4 h-4" /> Disable 2FA
                </button>
              </div>
            </>
          ) : (
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-3">
                <ShieldAlert className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">2FA is not enabled</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
              </div>
              <button
                onClick={() => setShow2FASetup(true)}
                className="w-full bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90"
                style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}
              >
                Enable Two-Factor Authentication
              </button>
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
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="text-xs font-bold bg-muted border border-border px-3 py-1.5 rounded-full hover:border-primary/50 transition-colors"
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </Row>
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
                <p className="text-xs text-muted-foreground">Notify me of new posts and replies</p>
              </div>
            </div>
            <Toggle checked={false} onChange={() => {}} />
          </Row>
        </Section>

        {/* ── Admin ── */}
        {!currentUser.isAdmin && (
          <Section title="Admin Access">
            <div className="px-6 py-5">
              <p className="text-xs text-muted-foreground mb-3">Enter the admin code to claim owner permissions.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={adminCode}
                  onChange={e => setAdminCode(e.target.value)}
                  placeholder="Admin code"
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-primary transition-colors"
                />
                <button
                  onClick={handleClaimAdmin}
                  className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:opacity-90"
                  style={{ boxShadow: '0 4px 12px hsl(var(--primary)/0.3)' }}
                >
                  Claim
                </button>
              </div>
              {adminMsg && <p className={`text-sm mt-2 ${adminMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{adminMsg}</p>}
            </div>
          </Section>
        )}

        {/* ── Account credentials summary ── */}
        <Section title="Account Info">
          <Row>
            <span className="text-sm text-muted-foreground">Username</span>
            <span className="font-bold text-sm">{currentUser.username}</span>
          </Row>
          <Row>
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="font-bold text-sm">{currentUser.email}</span>
          </Row>
          <Row>
            <span className="text-sm text-muted-foreground">Password</span>
            <span className="font-bold text-sm tracking-widest">{'•'.repeat(Math.min(currentUser.password.length, 10))}</span>
          </Row>
          <Row>
            <span className="text-sm text-muted-foreground">2FA status</span>
            <span className={`font-bold text-sm ${currentUser.has2FA ? 'text-green-400' : 'text-muted-foreground'}`}>
              {currentUser.has2FA ? 'Enabled' : 'Disabled'}
            </span>
          </Row>
        </Section>

        {/* ── Danger zone ── */}
        <Section title="Danger Zone">
          <div className="px-6 py-5 space-y-3">
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 bg-muted border border-border rounded-xl py-3 text-sm font-bold hover:border-red-500/40 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl py-3 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                <p className="text-sm text-red-400 font-bold mb-3">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-muted">Cancel</button>
                  <button onClick={() => { deleteAccount(); navigate('/'); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:opacity-90">Delete</button>
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
