import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

export interface OnlinePlayer {
  socketId: string;
  userId: string;
  username: string;
  bio: string;
  profileImage: string;
  bannerImage: string;
  role: string;
  isAdmin: boolean;
  joinedAt: number;
}

interface RealtimeContextType {
  socket: Socket | null;
  onlinePlayers: OnlinePlayer[];
  isConnected: boolean;
  announcePresence: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const buildPresence = useCallback(() => {
    if (!currentUser) return null;
    return {
      userId: currentUser.id,
      username: currentUser.username,
      bio: currentUser.bio,
      profileImage: currentUser.profileImage,
      bannerImage: currentUser.bannerImage,
      role: currentUser.role,
      isAdmin: currentUser.isAdmin,
    };
  }, [currentUser]);

  const announcePresence = useCallback(() => {
    const socket = socketRef.current;
    const presence = buildPresence();
    if (!socket || !presence || !socket.connected) return;
    socket.emit('presence:announce', presence);
  }, [buildPresence]);

  useEffect(() => {
    const socket = io({
      path: '/api/socket.io',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Announce presence immediately if signed in
      const presence = buildPresence();
      if (presence) socket.emit('presence:announce', presence);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('presence:list', (players: OnlinePlayer[]) => {
      setOnlinePlayers(players);
    });

    socket.on('presence:join', (player: OnlinePlayer) => {
      setOnlinePlayers((prev) => {
        // Avoid duplicates
        const without = prev.filter((p) => p.socketId !== player.socketId);
        return [...without, player];
      });
    });

    socket.on('presence:leave', (socketId: string) => {
      setOnlinePlayers((prev) => prev.filter((p) => p.socketId !== socketId));
    });

    socket.on('presence:update', (player: OnlinePlayer) => {
      setOnlinePlayers((prev) =>
        prev.map((p) => (p.socketId === player.socketId ? player : p))
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // one socket for the lifetime of the app

  // Re-announce when user signs in/out or updates profile
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    if (currentUser) {
      const presence = buildPresence();
      if (presence) socket.emit('presence:announce', presence);
    }
  }, [currentUser, buildPresence]);

  return (
    <RealtimeContext.Provider
      value={{
        socket: socketRef.current,
        onlinePlayers,
        isConnected,
        announcePresence,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used within RealtimeProvider');
  return ctx;
}
