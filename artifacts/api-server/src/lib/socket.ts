import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

export interface PresenceUser {
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

const presenceMap = new Map<string, PresenceUser>();

let _io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  _io = new Server(httpServer, {
    path: "/api/socket.io",
    cors: { origin: "*", credentials: false },
  });

  _io.on("connection", (socket) => {
    // Client announces presence when signed in
    socket.on(
      "presence:announce",
      (user: Omit<PresenceUser, "socketId" | "joinedAt">) => {
        const presence: PresenceUser = {
          ...user,
          socketId: socket.id,
          joinedAt: Date.now(),
        };
        presenceMap.set(socket.id, presence);
        // Send the full list to the newcomer
        socket.emit("presence:list", getPresenceList());
        // Tell everyone else someone joined
        socket.broadcast.emit("presence:join", presence);
      }
    );

    // Client updates their profile without reconnecting
    socket.on(
      "presence:update",
      (updates: Partial<Omit<PresenceUser, "socketId" | "joinedAt">>) => {
        const existing = presenceMap.get(socket.id);
        if (!existing) return;
        const updated = { ...existing, ...updates };
        presenceMap.set(socket.id, updated);
        _io?.emit("presence:update", updated);
      }
    );

    socket.on("disconnect", () => {
      const user = presenceMap.get(socket.id);
      presenceMap.delete(socket.id);
      if (user) {
        _io?.emit("presence:leave", socket.id);
      }
    });
  });

  return _io;
}

export function getIO(): Server {
  if (!_io) throw new Error("Socket.io not initialized");
  return _io;
}

export function getPresenceList(): PresenceUser[] {
  return Array.from(presenceMap.values());
}
