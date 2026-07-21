import { useState } from 'react';
import { useRealtime, OnlinePlayer } from '@/context/RealtimeContext';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/context/PostsContext';
import PlayerProfileModal from '@/components/PlayerProfileModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Wifi, WifiOff, Search, Star, Shield } from 'lucide-react';
import { format } from 'date-fns';

function RoleBadge({ role, isAdmin }: { role: string; isAdmin: boolean }) {
  if (isAdmin || role === 'owner') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        <Star size={8} /> Owner
      </span>
    );
  }
  if (role === 'mod') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
        <Shield size={8} /> Mod
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/50 border border-white/10">
      Player
    </span>
  );
}

function PlayerCard({
  player,
  postCount,
  onClick,
  isSelf,
}: {
  player: OnlinePlayer;
  postCount: number;
  onClick: () => void;
  isSelf: boolean;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all overflow-hidden group"
    >
      {/* Banner gradient */}
      <div className="h-16 bg-gradient-to-br from-purple-900/60 via-blue-900/60 to-indigo-900/60" />

      {/* Avatar */}
      <div className="px-4 pb-4">
        <div className="relative -mt-7 mb-3">
          {player.profileImage ? (
            <img
              src={player.profileImage}
              alt={player.username}
              className="w-14 h-14 rounded-full object-cover border-3 border-[#0d0d0d] border-[3px]"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-black text-lg border-[3px] border-[#0d0d0d]">
              {player.username.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Online dot */}
          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0d0d0d]" />
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-bold text-white text-sm group-hover:text-green-300 transition-colors truncate">
            {player.username}
          </span>
          {isSelf && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
              You
            </span>
          )}
          <RoleBadge role={player.role} isAdmin={player.isAdmin} />
        </div>

        {player.bio ? (
          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{player.bio}</p>
        ) : (
          <p className="text-xs text-white/25 italic">No bio set.</p>
        )}

        <div className="flex items-center gap-3 mt-3 text-xs text-white/40">
          <span>{postCount} post{postCount !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>Joined {format(new Date(player.joinedAt), 'h:mm a')}</span>
        </div>
      </div>

      {isSelf && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[9px] font-bold border border-green-500/30">
          YOU
        </div>
      )}
    </motion.button>
  );
}

export default function Players() {
  const { onlinePlayers, isConnected } = useRealtime();
  const { currentUser } = useAuth();
  const { posts } = usePosts();
  const [selectedPlayer, setSelectedPlayer] = useState<OnlinePlayer | null>(null);
  const [query, setQuery] = useState('');

  const filtered = onlinePlayers.filter((p) =>
    p.username.toLowerCase().includes(query.toLowerCase()) ||
    p.bio.toLowerCase().includes(query.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (a.userId === currentUser?.id) return -1;
    if (b.userId === currentUser?.id) return 1;
    if (a.isAdmin || a.role === 'owner') return -1;
    if (b.isAdmin || b.role === 'owner') return 1;
    return a.joinedAt - b.joinedAt;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-white">Players Online</h1>
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30">
              {onlinePlayers.length} online
            </span>
            <span className={`flex items-center gap-1.5 text-xs font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isConnected ? 'Connected' : 'Connecting…'}
            </span>
          </div>
          <p className="text-white/40 text-sm">
            Everyone currently connected to the revival. Click a player to view their profile.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search players…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/25"
          />
        </div>

        {/* Grid */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users size={40} className="text-white/20 mb-4" />
            {!isConnected ? (
              <p className="text-white/40">Connecting to the server…</p>
            ) : query ? (
              <p className="text-white/40">No players match "{query}"</p>
            ) : (
              <>
                <p className="text-white/50 font-semibold">Nobody else is online right now.</p>
                <p className="text-white/30 text-sm mt-1">
                  Sign in and share the link — your profile will appear here.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {sorted.map((player) => (
                <PlayerCard
                  key={player.socketId}
                  player={player}
                  postCount={posts.filter((p) => p.authorId === player.userId).length}
                  onClick={() => setSelectedPlayer(player)}
                  isSelf={player.userId === currentUser?.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
