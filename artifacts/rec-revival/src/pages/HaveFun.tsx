import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/context/PostsContext';
import { Link } from 'wouter';
import {
  PenLine, Megaphone, Users, Search, ImagePlus, X, Trash2, ShieldCheck
} from 'lucide-react';

type Tab = 'posts' | 'announcements' | 'players';

// ── Relative time ─────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, canDelete, onDelete }: {
  post: ReturnType<typeof usePosts>['posts'][number];
  canDelete: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/30 transition-colors">
      {post.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-black flex-shrink-0">
              {post.authorUsername[0].toUpperCase()}
            </span>
            <div>
              <span className="font-black text-sm">{post.authorUsername}</span>
              <span className="text-xs text-muted-foreground ml-2">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
          {canDelete && (
            <button onClick={onDelete} className="text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        {post.title && (
          <h3 className="font-black text-base mb-2 bloom-text">{post.title}</h3>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>
    </div>
  );
}

// ── Compose form ──────────────────────────────────────────────────────────────
function ComposeForm({ isAnnouncement, onSubmit }: {
  isAnnouncement: boolean;
  onSubmit: (title: string, content: string, imageUrl: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageField, setShowImageField] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(title, content, imageUrl);
    setTitle(''); setContent(''); setImageUrl(''); setShowImageField(false); setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-card border border-dashed border-border rounded-3xl p-4 flex items-center gap-3 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors text-left mb-5"
      >
        <PenLine className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">{isAnnouncement ? 'Post an announcement…' : 'Share something with the community…'}</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-primary/30 rounded-3xl p-5 mb-5" style={{ boxShadow: '0 0 0 1px hsl(var(--primary)/0.1), 0 8px 32px rgba(0,0,0,0.2)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-sm">{isAnnouncement ? 'New Announcement' : 'New Post'}</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-black outline-none focus:border-primary transition-colors mb-3"
      />

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={isAnnouncement ? 'Write an announcement for the community…' : 'What\'s on your mind? Share updates, rooms, or just say hi!'}
        rows={5}
        required
        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none mb-3"
      />

      {showImageField && (
        <div className="relative mb-3">
          <input
            type="url"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors pr-10"
          />
          <button type="button" onClick={() => { setShowImageField(false); setImageUrl(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {imageUrl && (
        <div className="mb-3 rounded-2xl overflow-hidden border border-border aspect-video">
          <img src={imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowImageField(v => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ImagePlus className="w-4 h-4" /> Add image
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!content.trim()}
            className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-black hover:opacity-90 disabled:opacity-60"
            style={{ boxShadow: '0 4px 12px hsl(var(--primary)/0.3)' }}
          >
            {isAnnouncement ? 'Post Announcement' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Player card ───────────────────────────────────────────────────────────────
function PlayerCard({ user }: { user: ReturnType<typeof useAuth>['users'][number] }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4 hover:border-primary/30 transition-colors">
      <span className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-xl font-black flex-shrink-0">
        {user.username[0].toUpperCase()}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-black text-sm">{user.username}</span>
          {user.isAdmin && (
            <span className="flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Admin
            </span>
          )}
          {user.has2FA && (
            <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">2FA</span>
          )}
        </div>
        {user.bio ? (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{user.bio}</p>
        ) : (
          <p className="text-xs text-muted-foreground/50 mt-1 italic">No bio yet.</p>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HaveFun() {
  const { currentUser, users } = useAuth();
  const { posts, createPost, deletePost } = usePosts();
  const [tab, setTab] = useState<Tab>('posts');
  const [search, setSearch] = useState('');

  const regularPosts = posts.filter(p => !p.isAnnouncement);
  const announcements = posts.filter(p => p.isAnnouncement);

  const filteredPlayers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(u => u.username.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q));
  }, [users, search]);

  const handlePost = (title: string, content: string, imageUrl: string, isAnnouncement: boolean) => {
    if (!currentUser) return;
    createPost({
      authorId: currentUser.id,
      authorUsername: currentUser.username,
      title,
      content,
      imageUrl: imageUrl || undefined,
      isAnnouncement,
    });
  };

  const canDelete = (post: typeof posts[number]) =>
    !!(currentUser && (currentUser.id === post.authorId || currentUser.isAdmin));

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'posts', label: 'Posts', icon: <PenLine className="w-4 h-4" />, count: regularPosts.length },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone className="w-4 h-4" />, count: announcements.length },
    { id: 'players', label: 'Players', icon: <Users className="w-4 h-4" />, count: users.length },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-16">
      {/* Hero */}
      <section className="py-16 px-6 border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-black bloom-text mb-3">
            Have <span className="text-primary">Fun</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Share posts, browse announcements, and find players on the revival.
          </p>
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
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={tab === t.id ? { boxShadow: '0 4px 12px hsl(var(--primary)/0.25)' } : {}}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${tab === t.id ? 'bg-white/25' : 'bg-muted'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Posts tab ── */}
        {tab === 'posts' && (
          <div>
            {currentUser && (
              <ComposeForm
                isAnnouncement={false}
                onSubmit={(title, content, imageUrl) => handlePost(title, content, imageUrl, false)}
              />
            )}
            {regularPosts.length === 0 ? (
              <div className="text-center py-16">
                <PenLine className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold">No posts yet</p>
                <p className="text-sm text-muted-foreground/60">Be the first to share something!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {regularPosts.map(post => (
                  <PostCard key={post.id} post={post} canDelete={canDelete(post)} onDelete={() => deletePost(post.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Announcements tab ── */}
        {tab === 'announcements' && (
          <div>
            {currentUser?.isAdmin && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary">Admin — Only you can post here</span>
                </div>
                <ComposeForm
                  isAnnouncement
                  onSubmit={(title, content, imageUrl) => handlePost(title, content, imageUrl, true)}
                />
              </div>
            )}
            {announcements.length === 0 ? (
              <div className="text-center py-16">
                <Megaphone className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold">No announcements yet</p>
                {currentUser?.isAdmin && <p className="text-sm text-muted-foreground/60">Post above to make an announcement.</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map(post => (
                  <div key={post.id} className="relative">
                    <div className="absolute -top-2 left-5 flex items-center gap-1.5 bg-primary text-white text-xs font-black px-2.5 py-1 rounded-full z-10">
                      <Megaphone className="w-3 h-3" /> Announcement
                    </div>
                    <PostCard post={post} canDelete={canDelete(post)} onDelete={() => deletePost(post.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Players tab ── */}
        {tab === 'players' && (
          <div>
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search players by username or bio…"
                className="w-full bg-card border border-border rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-primary transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {filteredPlayers.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold">No players found</p>
                <p className="text-sm text-muted-foreground/60">Try a different search.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPlayers.map(u => (
                  <PlayerCard key={u.id} user={u} />
                ))}
              </div>
            )}

            {users.length === 0 && (
              <div className="text-center py-16">
                <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold">No registered players yet</p>
                <p className="text-sm text-muted-foreground/60">Be the first to <Link href="/sign-up" className="text-primary">create an account</Link>!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
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
