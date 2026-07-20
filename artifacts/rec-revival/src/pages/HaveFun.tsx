import { useState, useMemo, useCallback } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { usePosts, Post } from '@/context/PostsContext';
import { Link } from 'wouter';
import Avatar from '@/components/Avatar';
import {
  PenLine, Megaphone, Users, Search, ImagePlus, X, Trash2,
  ShieldCheck, Shield, Crown, UserPlus, UserCheck
} from 'lucide-react';

type Tab = 'posts' | 'announcements' | 'players';

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Nametag pills ─────────────────────────────────────────────────────────────
const ROLE_META: Record<UserRole, { label: string; classes: string; icon?: React.ReactNode } | null> = {
  user: null,
  mod: { label: 'Mod', classes: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: <Shield className="w-2.5 h-2.5" /> },
  owner: { label: 'Owner', classes: 'text-primary bg-primary/10 border-primary/30', icon: <Crown className="w-2.5 h-2.5" /> },
};

function Nametags({ role, isAdmin, has2FA }: { role: UserRole; isAdmin: boolean; has2FA: boolean }) {
  const roleMeta = ROLE_META[role];
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {roleMeta && (
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full border ${roleMeta.classes}`}>
          {roleMeta.icon} {roleMeta.label}
        </span>
      )}
      {isAdmin && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full border text-amber-400 bg-amber-500/10 border-amber-500/30">
          <ShieldCheck className="w-2.5 h-2.5" /> Admin
        </span>
      )}
      {has2FA && (
        <span className="inline-flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-full border text-green-400 bg-green-500/10 border-green-500/30">
          2FA
        </span>
      )}
    </div>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, canDelete, onDelete }: { post: Post; canDelete: boolean; onDelete: () => void }) {
  const { users } = useAuth();
  const author = users.find(u => u.id === post.authorId);

  return (
    <article className="bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/25 transition-colors">
      {post.imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img src={post.imageUrl} alt="" className="w-full h-full object-cover"
            onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }} />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {author
              ? <Avatar user={author} size="sm" showOnline />
              : <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0" />
            }
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-sm">{post.authorUsername}</span>
                {post.authorRole && post.authorRole !== 'user' && (
                  <Nametags role={post.authorRole} isAdmin={!!post.authorIsAdmin} has2FA={false} />
                )}
              </div>
              <span className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
          {canDelete && (
            <button onClick={onDelete} className="text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {post.title && <h3 className="font-black text-base mb-2 bloom-text">{post.title}</h3>}
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>
    </article>
  );
}

// ── Compose form ──────────────────────────────────────────────────────────────
function ComposeForm({
  isAnnouncement,
  placeholder,
  buttonLabel,
  onPost,
}: {
  isAnnouncement: boolean;
  placeholder: string;
  buttonLabel: string;
  onPost: (title: string, content: string, imageUrl: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImage, setShowImage] = useState(false);

  const reset = () => { setTitle(''); setContent(''); setImageUrl(''); setShowImage(false); setOpen(false); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    onPost(title.trim(), trimmed, imageUrl.trim());
    reset();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-card border border-dashed border-border rounded-3xl p-4 flex items-center gap-3 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors text-left mb-4"
      >
        <PenLine className="w-4 h-4 flex-shrink-0 text-primary" />
        <span className="text-sm">{placeholder}</span>
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-card border border-primary/30 rounded-3xl p-5 mb-4" style={{ boxShadow: '0 0 0 1px hsl(var(--primary)/0.1), 0 8px 32px rgba(0,0,0,0.2)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-sm">{isAnnouncement ? 'New Announcement' : 'New Post'}</h3>
        <button type="button" onClick={reset} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)"
        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-black outline-none focus:border-primary transition-colors mb-3" />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={placeholder} rows={5} required
        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none mb-3" />

      {showImage && (
        <div className="relative mb-3">
          <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Paste image URL…"
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors pr-10" />
          <button type="button" onClick={() => { setShowImage(false); setImageUrl(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {imageUrl && (
        <div className="mb-3 rounded-2xl overflow-hidden border border-border aspect-video bg-muted">
          <img src={imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setShowImage(v => !v)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
          <ImagePlus className="w-4 h-4" /> {showImage ? 'Remove image' : 'Add image'}
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={reset} className="px-4 py-2 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-colors">Cancel</button>
          <button type="submit" disabled={!content.trim()} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-black hover:opacity-90 disabled:opacity-50 transition-opacity" style={{ boxShadow: '0 4px 12px hsl(var(--primary)/0.3)' }}>
            {buttonLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Player card ───────────────────────────────────────────────────────────────
function PlayerCard({ user }: { user: ReturnType<typeof useAuth>['users'][number] }) {
  const { currentUser, subscribe, unsubscribe, isFollowing, getFollowerCount } = useAuth();
  const following = isFollowing(user.id);
  const followerCount = getFollowerCount(user.id);
  const isSelf = currentUser?.id === user.id;

  const handleFollow = () => {
    if (!currentUser || isSelf) return;
    if (following) unsubscribe(user.id);
    else subscribe(user.id);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4 hover:border-primary/30 transition-colors">
      <Avatar user={user} size="md" showOnline />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="font-black text-sm">{user.username}</span>
              <Nametags role={user.role} isAdmin={user.isAdmin} has2FA={user.has2FA} />
            </div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{followerCount}</span> subscriber{followerCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          {currentUser && !isSelf && (
            <button
              onClick={handleFollow}
              className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full border transition-all flex-shrink-0 ${
                following
                  ? 'bg-primary/10 border-primary/30 text-primary hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
              }`}
            >
              {following
                ? <><UserCheck className="w-3 h-3" /> Following</>
                : <><UserPlus className="w-3 h-3" /> Subscribe</>
              }
            </button>
          )}
        </div>
        {user.bio
          ? <p className="text-xs text-muted-foreground leading-relaxed">{user.bio}</p>
          : <p className="text-xs text-muted-foreground/40 italic">No bio yet.</p>
        }
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HaveFun() {
  const { currentUser, users } = useAuth();
  const { posts, createPost, deletePost } = usePosts();
  const [tab, setTab] = useState<Tab>('posts');
  const [search, setSearch] = useState('');

  const regularPosts = useMemo(() => posts.filter(p => !p.isAnnouncement), [posts]);
  const announcements = useMemo(() => posts.filter(p => p.isAnnouncement), [posts]);

  const filteredPlayers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(u => u.username.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q));
  }, [users, search]);

  const handlePost = useCallback((title: string, content: string, imageUrl: string, isAnnouncement: boolean) => {
    if (!currentUser) return;
    createPost({
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      authorIcon: currentUser.profileImage || currentUser.profileIcon,
      authorRole: currentUser.role,
      authorIsAdmin: currentUser.isAdmin,
      title,
      content,
      imageUrl: imageUrl || undefined,
      isAnnouncement,
    });
  }, [currentUser, createPost]);

  const canDelete = useCallback((post: Post) =>
    !!(currentUser && (currentUser.id === post.authorId || currentUser.isAdmin)),
    [currentUser]
  );

  const tabs = [
    { id: 'posts' as Tab,         label: 'Posts',         icon: <PenLine className="w-4 h-4" />,   count: regularPosts.length },
    { id: 'announcements' as Tab, label: 'Announcements', icon: <Megaphone className="w-4 h-4" />, count: announcements.length },
    { id: 'players' as Tab,       label: 'Players',       icon: <Users className="w-4 h-4" />,     count: users.length },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      {/* Hero */}
      <section className="py-16 px-6 border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-black bloom-text mb-3">
            Have <span className="text-primary">Fun</span>
          </h1>
          <p className="text-muted-foreground text-lg">Share posts, browse announcements, and find players on the revival.</p>
          {!currentUser && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/sign-in" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90" style={{ boxShadow: '0 8px 24px hsl(var(--primary)/0.3)' }}>
                Sign In to Post
              </Link>
              <Link href="/sign-up" className="bg-card border border-border px-6 py-2.5 rounded-full font-bold text-sm hover:border-primary/50 transition-colors">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-card border border-border rounded-2xl mb-7 w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
              style={tab === t.id ? { boxShadow: '0 4px 12px hsl(var(--primary)/0.25)' } : {}}
            >
              {t.icon} {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${tab === t.id ? 'bg-white/25' : 'bg-muted'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Posts */}
        {tab === 'posts' && (
          <>
            {currentUser && (
              <ComposeForm isAnnouncement={false} placeholder="Share something with the community…" buttonLabel="Post"
                onPost={(title, content, imageUrl) => handlePost(title, content, imageUrl, false)} />
            )}
            {regularPosts.length === 0 ? (
              <div className="text-center py-16">
                <PenLine className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold">No posts yet.</p>
                <p className="text-sm text-muted-foreground/60">Be the first to share something!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {regularPosts.map(post => (
                  <PostCard key={post.id} post={post} canDelete={canDelete(post)} onDelete={() => deletePost(post.id)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Announcements */}
        {tab === 'announcements' && (
          <>
            {currentUser?.isAdmin && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary">Admin — only you can post here</span>
                </div>
                <ComposeForm isAnnouncement placeholder="Write an announcement for the community…" buttonLabel="Post Announcement"
                  onPost={(title, content, imageUrl) => handlePost(title, content, imageUrl, true)} />
              </>
            )}
            {announcements.length === 0 ? (
              <div className="text-center py-16">
                <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold">No announcements yet.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {announcements.map(post => (
                  <div key={post.id} className="relative pt-3">
                    <div className="absolute top-0 left-5 flex items-center gap-1.5 bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-full z-10">
                      <Megaphone className="w-2.5 h-2.5" /> Announcement
                    </div>
                    <PostCard post={post} canDelete={canDelete(post)} onDelete={() => deletePost(post.id)} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Players */}
        {tab === 'players' && (
          <>
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players…"
                className="w-full bg-card border border-border rounded-2xl pl-11 pr-10 py-3.5 text-sm outline-none focus:border-primary transition-colors" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {filteredPlayers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold">{users.length === 0 ? 'No players registered yet.' : 'No players match your search.'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPlayers.map(u => <PlayerCard key={u.id} user={u} />)}
              </div>
            )}
          </>
        )}
      </div>

      <footer className="border-t border-border py-10 px-6 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-black text-primary text-lg">Rec Room Revival</span>
          <p className="text-xs text-muted-foreground">Not affiliated with Against Gravity. A fan project.</p>
          <p className="text-xs text-muted-foreground">2026</p>
        </div>
      </footer>
    </div>
  );
}
