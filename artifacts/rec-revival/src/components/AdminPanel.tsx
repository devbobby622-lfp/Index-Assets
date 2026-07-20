import { useState, useMemo } from 'react';
import { useAuth, User, UserRole } from '@/context/AuthContext';
import { usePosts } from '@/context/PostsContext';
import {
  X, Search, Shield, ShieldBan, Ban, UserX, Clock, Megaphone,
  ChevronDown, ChevronRight, Check, ImagePlus, Trash2, Crown, Users
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────
const ROLE_LABELS: Record<UserRole, { label: string; color: string; bg: string; border: string }> = {
  user:  { label: 'User',  color: 'text-muted-foreground', bg: 'bg-muted',          border: 'border-border' },
  mod:   { label: 'Mod',   color: 'text-blue-400',         bg: 'bg-blue-500/10',     border: 'border-blue-500/30' },
  owner: { label: 'Owner', color: 'text-primary',          bg: 'bg-primary/10',      border: 'border-primary/30' },
};

function RolePill({ role }: { role: UserRole }) {
  const r = ROLE_LABELS[role];
  return (
    <span className={`inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-full border ${r.color} ${r.bg} ${r.border}`}>
      {role === 'owner' && <Crown className="w-2.5 h-2.5 mr-0.5" />}
      {role === 'mod' && <Shield className="w-2.5 h-2.5 mr-0.5" />}
      {r.label}
    </span>
  );
}

function banLabel(u: User): string {
  if (u.bannedUntil === null) return '';
  if (u.bannedUntil === -1) return 'Permanent ban';
  const diff = u.bannedUntil - Date.now();
  if (diff <= 0) return 'Ban expired';
  const s = Math.floor(diff / 1000);
  if (s < 60) return `Banned ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `Banned ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Banned ${h}h`;
  return `Banned ${Math.floor(h / 24)}d`;
}

function isBannedNow(u: User): boolean {
  if (u.bannedUntil === null) return false;
  if (u.bannedUntil === -1) return true;
  return Date.now() < u.bannedUntil;
}

type DurationUnit = 'seconds' | 'minutes' | 'hours' | 'days';
const UNIT_MS: Record<DurationUnit, number> = {
  seconds: 1000, minutes: 60_000, hours: 3_600_000, days: 86_400_000,
};

// ── Player row ─────────────────────────────────────────────────────────────────
function PlayerRow({ user, currentUserId }: { user: User; currentUserId: string }) {
  const { setUserRole, banUser, unbanUser, deleteUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [banAmount, setBanAmount] = useState('1');
  const [banUnit, setBanUnit] = useState<DurationUnit>('hours');
  const [kickAmount, setKickAmount] = useState('60');
  const [kickUnit, setKickUnit] = useState<DurationUnit>('seconds');
  const [permanent, setPermanent] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const banned = isBannedNow(user);
  const isSelf = user.id === currentUserId;

  const handleBan = () => {
    const ms = permanent ? null : Number(banAmount) * UNIT_MS[banUnit];
    banUser(user.id, ms);
  };

  const handleKick = () => {
    const ms = Number(kickAmount) * UNIT_MS[kickUnit];
    banUser(user.id, ms);
  };

  return (
    <div className={`rounded-2xl border transition-colors ${banned ? 'border-red-500/30 bg-red-500/5' : 'border-border bg-background'}`}>
      {/* Main row */}
      <div className="flex items-center gap-3 p-3">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-xl flex-shrink-0">
          {user.profileIcon || <span className="text-primary font-black text-sm">{user.username[0]?.toUpperCase()}</span>}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-black text-sm">{user.username}</span>
            {/* Horizontal stacked nametags */}
            <RolePill role={user.role} />
            {user.isAdmin && (
              <span className="inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-full border text-amber-400 bg-amber-500/10 border-amber-500/30">
                <Shield className="w-2.5 h-2.5 mr-0.5" /> Admin
              </span>
            )}
            {banned && (
              <span className="inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-full border text-red-400 bg-red-500/10 border-red-500/30">
                <Ban className="w-2.5 h-2.5 mr-0.5" /> {banLabel(user)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>

        {!isSelf && (
          <button
            onClick={() => setOpen(v => !v)}
            className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground border border-border rounded-lg px-2 py-1 hover:border-primary/40 transition-colors"
          >
            Manage {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Manage panel */}
      {open && !isSelf && (
        <div className="border-t border-border p-3 space-y-3">
          {/* Role */}
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-1.5">Role</p>
            <div className="flex gap-1.5">
              {(['user', 'mod', 'owner'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => setUserRole(user.id, r)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-colors ${
                    user.role === r
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Kick */}
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-1.5">Kick (temp ban)</p>
            <div className="flex gap-1.5">
              <input
                type="number"
                min="1"
                value={kickAmount}
                onChange={e => setKickAmount(e.target.value)}
                className="w-20 bg-background border border-border rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-primary"
              />
              <select
                value={kickUnit}
                onChange={e => setKickUnit(e.target.value as DurationUnit)}
                className="flex-1 bg-background border border-border rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-primary"
              >
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
              <button
                onClick={handleKick}
                className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-amber-500/25 transition-colors"
              >
                <Clock className="w-3 h-3" /> Kick
              </button>
            </div>
          </div>

          {/* Ban */}
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-1.5">Ban</p>
            <div className="flex gap-1.5 mb-1.5">
              <input
                type="number"
                min="1"
                value={banAmount}
                onChange={e => setBanAmount(e.target.value)}
                disabled={permanent}
                className="w-20 bg-background border border-border rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-primary disabled:opacity-40"
              />
              <select
                value={banUnit}
                onChange={e => setBanUnit(e.target.value as DurationUnit)}
                disabled={permanent}
                className="flex-1 bg-background border border-border rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-primary disabled:opacity-40"
              >
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
              <button
                onClick={handleBan}
                className="flex items-center gap-1 bg-red-500/15 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-red-500/25 transition-colors"
              >
                <ShieldBan className="w-3 h-3" /> Ban
              </button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={permanent} onChange={e => setPermanent(e.target.checked)} className="accent-red-500" />
              <span className="text-xs text-muted-foreground">Permanent ban</span>
            </label>
          </div>

          {/* Unban */}
          {banned && (
            <button
              onClick={() => unbanUser(user.id)}
              className="w-full py-1.5 rounded-lg text-xs font-black border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
            >
              ✓ Remove Ban
            </button>
          )}

          {/* Delete user */}
          {!confirmDel ? (
            <button
              onClick={() => setConfirmDel(true)}
              className="w-full py-1.5 rounded-lg text-xs font-black border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
            >
              <UserX className="w-3 h-3" /> Delete Account
            </button>
          ) : (
            <div className="flex gap-1.5">
              <button onClick={() => setConfirmDel(false)} className="flex-1 py-1.5 rounded-lg text-xs font-bold border border-border text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={() => deleteUser(user.id)} className="flex-1 py-1.5 rounded-lg text-xs font-black bg-red-500 text-white hover:opacity-90">Delete</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Announce form ──────────────────────────────────────────────────────────────
function AnnounceForm({ currentUser }: { currentUser: NonNullable<ReturnType<typeof useAuth>['currentUser']> }) {
  const { createPost } = usePosts();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createPost({
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      isAnnouncement: true,
    });
    setTitle(''); setContent(''); setImageUrl('');
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Announcement title (optional)"
        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-black outline-none focus:border-primary transition-colors"
      />
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write your announcement…"
        rows={4}
        required
        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none"
      />
      <div className="relative">
        <ImagePlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="url"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          placeholder="Image URL (optional)"
          className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>
      {imageUrl && (
        <div className="rounded-xl overflow-hidden border border-border aspect-video">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
        </div>
      )}
      <button
        type="submit"
        disabled={!content.trim()}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
        style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}
      >
        {done ? <><Check className="w-4 h-4" /> Posted!</> : <><Megaphone className="w-4 h-4" /> Post Announcement</>}
      </button>
    </form>
  );
}

// ── Main AdminPanel ────────────────────────────────────────────────────────────
type PanelTab = 'players' | 'bans' | 'announce';

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const { users, currentUser } = useAuth();
  const { unbanUser } = useAuth();
  const [tab, setTab] = useState<PanelTab>('players');
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  const bannedUsers = useMemo(() =>
    users.filter(u => {
      if (u.bannedUntil === null) return false;
      if (u.bannedUntil === -1) return true;
      return Date.now() < u.bannedUntil;
    }),
    [users]
  );

  const tabs: { id: PanelTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'players',  label: 'Players',  icon: <Users className="w-4 h-4" />,    count: filteredUsers.length },
    { id: 'bans',     label: 'Bans',     icon: <Ban className="w-4 h-4" />,       count: bannedUsers.length },
    { id: 'announce', label: 'Announce', icon: <Megaphone className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div
        className="relative h-full w-full max-w-md bg-card border-l border-border flex flex-col overflow-hidden"
        style={{ boxShadow: '-24px 0 64px rgba(0,0,0,0.4)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-black text-base">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">Rec Room Revival</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-3 border-b border-border flex-shrink-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                tab === t.id ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              style={tab === t.id ? { boxShadow: '0 4px 12px hsl(var(--primary)/0.25)' } : {}}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${tab === t.id ? 'bg-white/25' : 'bg-muted border border-border'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Players tab */}
          {tab === 'players' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by username or email…"
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              {filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">No players found.</p>
              ) : (
                filteredUsers.map(u => (
                  <PlayerRow key={u.id} user={u} currentUserId={currentUser?.id ?? ''} />
                ))
              )}
            </div>
          )}

          {/* Bans tab */}
          {tab === 'bans' && (
            <div className="space-y-3">
              {bannedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Ban className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active bans.</p>
                </div>
              ) : (
                bannedUsers.map(u => (
                  <div key={u.id} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center text-xl flex-shrink-0">
                      {u.profileIcon || <span className="text-red-400 font-black text-sm">{u.username[0]?.toUpperCase()}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-sm">{u.username}</span>
                        <RolePill role={u.role} />
                      </div>
                      <p className="text-xs text-red-400 font-bold">{banLabel(u)}</p>
                    </div>
                    <button
                      onClick={() => unbanUser(u.id)}
                      className="flex-shrink-0 text-xs font-black text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      Remove Ban
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Announce tab */}
          {tab === 'announce' && currentUser && (
            <AnnounceForm currentUser={currentUser} />
          )}
        </div>
      </div>
    </div>
  );
}
