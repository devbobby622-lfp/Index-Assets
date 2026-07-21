import { useState } from 'react';
import { useRealtime, OnlinePlayer } from '@/context/RealtimeContext';
import { useAuth } from '@/context/AuthContext';
import PlayerProfileModal from './PlayerProfileModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Users } from 'lucide-react';

function RoleBadge({ role, isAdmin }: { role: string; isAdmin: boolean }) {
  if (isAdmin || role === 'owner') {
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        OWNER
      </span>
    );
  }
  if (role === 'mod') {
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
        MOD
      </span>
    );
  }
  return null;
}

function PlayerCard({ player, onClick }: { player: OnlinePlayer; onClick: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onClick}
      className="flex items-start gap-3 w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {player.profileImage ? (
          <img
            src={player.profileImage}
            alt={player.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-green-500/60"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-green-500/60">
            {player.username.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Online dot */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0d0d0d]" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-white truncate group-hover:text-green-300 transition-colors">
            {player.username}
          </span>
          <RoleBadge role={player.role} isAdmin={player.isAdmin} />
        </div>
        {player.bio && (
          <p className="text-xs text-white/50 truncate mt-0.5">{player.bio}</p>
        )}
      </div>
    </motion.button>
  );
}

export default function PlayersOnline() {
  const { onlinePlayers, isConnected } = useRealtime();
  const { currentUser } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState<OnlinePlayer | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sort: current user first, then by joinedAt
  const sorted = [...onlinePlayers].sort((a, b) => {
    if (a.userId === currentUser?.id) return -1;
    if (b.userId === currentUser?.id) return 1;
    return a.joinedAt - b.joinedAt;
  });

  return (
    <>
      <div className="w-full rounded-xl border border-white/10 bg-black/40 backdrop-blur overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsCollapsed((c) => !c)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Wifi
              size={14}
              className={isConnected ? 'text-green-400' : 'text-red-400'}
            />
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <Users size={14} className="text-white/60" />
              Players Online
            </span>
            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
              {onlinePlayers.length}
            </span>
          </div>
          <span className="text-white/40 text-xs">
            {isCollapsed ? '▼' : '▲'}
          </span>
        </button>

        {/* Player list */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 flex flex-col gap-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                {sorted.length === 0 ? (
                  <p className="text-center text-white/30 text-xs py-4">
                    {isConnected ? 'No players online yet' : 'Connecting…'}
                  </p>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {sorted.map((player) => (
                      <PlayerCard
                        key={player.socketId}
                        player={player}
                        onClick={() => setSelectedPlayer(player)}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile modal */}
      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </>
  );
}
