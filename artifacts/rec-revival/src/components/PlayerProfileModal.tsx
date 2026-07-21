import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Star } from 'lucide-react';
import { OnlinePlayer } from '@/context/RealtimeContext';
import { usePosts } from '@/context/PostsContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface Props {
  player: OnlinePlayer;
  onClose: () => void;
}

function RoleBadge({ role, isAdmin }: { role: string; isAdmin: boolean }) {
  if (isAdmin || role === 'owner') {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
        <Star size={10} />
        Owner
      </span>
    );
  }
  if (role === 'mod') {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
        <Shield size={10} />
        Mod
      </span>
    );
  }
  return (
    <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/10 text-white/60 border border-white/10">
      Player
    </span>
  );
}

export default function PlayerProfileModal({ player, onClose }: Props) {
  const { posts } = usePosts();
  const { currentUser, isFollowing, subscribe, unsubscribe } = useAuth();

  const playerPosts = posts
    .filter((p) => p.authorId === player.userId)
    .slice(0, 5);

  const following = currentUser ? isFollowing(player.userId) : false;
  const isSelf = currentUser?.id === player.userId;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-md rounded-2xl bg-[#111] border border-white/10 overflow-hidden shadow-2xl"
        >
          {/* Banner */}
          <div className="h-24 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors bg-black/40 rounded-full p-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* Avatar (overlaps banner) */}
          <div className="px-5 pb-5">
            <div className="relative -mt-8 mb-3 flex items-end justify-between">
              <div className="relative">
                {player.profileImage ? (
                  <img
                    src={player.profileImage}
                    alt={player.username}
                    className="w-16 h-16 rounded-full object-cover border-4 border-[#111]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl border-4 border-[#111]">
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Online indicator */}
                <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-[#111]" />
              </div>

              {/* Follow button */}
              {currentUser && !isSelf && (
                <button
                  onClick={() =>
                    following
                      ? unsubscribe(player.userId)
                      : subscribe(player.userId)
                  }
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    following
                      ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      : 'bg-purple-600 text-white hover:bg-purple-500'
                  }`}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            {/* Name + role */}
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white">{player.username}</h2>
              <RoleBadge role={player.role} isAdmin={player.isAdmin} />
            </div>

            {/* Bio */}
            {player.bio ? (
              <p className="text-sm text-white/60 mb-4 leading-relaxed">
                {player.bio}
              </p>
            ) : (
              <p className="text-sm text-white/30 italic mb-4">No bio set.</p>
            )}

            {/* Recent posts */}
            {playerPosts.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                  Recent Posts
                </h3>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                  {playerPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-lg bg-white/5 border border-white/5"
                    >
                      {post.title && (
                        <p className="text-sm font-medium text-white mb-0.5">
                          {post.title}
                        </p>
                      )}
                      <p className="text-xs text-white/60 line-clamp-2">
                        {post.content}
                      </p>
                      <p className="text-[10px] text-white/30 mt-1">
                        {format(new Date(post.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
