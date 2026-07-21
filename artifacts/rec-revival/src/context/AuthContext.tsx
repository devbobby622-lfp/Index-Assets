import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as OTPAuth from 'otpauth';

export type UserRole = 'user' | 'mod' | 'owner';

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  bio: string;
  profileIcon: string;      // legacy – kept for compat
  profileImage: string;     // data URL or '' for default avatar
  bannerImage: string;      // data URL or '' for no banner
  following: string[];      // list of user IDs this user follows
  lastSeen: number;         // unix ms; updated by heartbeat while online
  has2FA: boolean;
  twoFASeed: string;
  backupCodes: string[];
  isAdmin: boolean;
  role: UserRole;
  bannedUntil: number | null;
}

interface AuthState {
  users: User[];
  currentUserId: string | null;
  pending2FAUserId: string | null;
}

const SUPER_ADMIN_EMAIL = 'darioncj112@gmail.com';

interface AuthContextType {
  users: User[];
  currentUser: User | null;
  pending2FAUser: User | null;
  isSuperAdmin: boolean;
  signUp: (username: string, password: string, email: string) => { success: boolean; error?: string };
  signIn: (username: string, password: string) => { success: boolean; needs2FA?: boolean; error?: string };
  verify2FA: (code: string) => { success: boolean; error?: string };
  useBackupCode: (code: string) => { success: boolean; error?: string };
  signOut: () => void;
  updateUser: (updates: Partial<Pick<User, 'username' | 'password' | 'email' | 'bio' | 'isAdmin' | 'profileIcon' | 'profileImage' | 'bannerImage'>>) => void;
  deleteAccount: () => void;
  enable2FA: () => { seed: string; backupCodes: string[] };
  confirm2FAEnable: (seed: string, backupCodes: string[], code: string) => { success: boolean; error?: string };
  disable2FA: () => void;
  disableUser2FA: (userId: string) => void;
  claimAdmin: (code: string) => boolean;
  getTOTPCode: (seed: string) => string;
  getEmailCode: (userId: string) => string;
  // Follow
  subscribe: (targetId: string) => void;
  unsubscribe: (targetId: string) => void;
  isFollowing: (targetId: string) => boolean;
  getFollowerCount: (targetId: string) => number;
  // Admin ops
  setUserRole: (userId: string, role: UserRole) => void;
  banUser: (userId: string, durationMs: number | null) => void;
  unbanUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
}

const STORAGE_KEY = 'rr_auth_v4';
const ADMIN_CODE = 'REVIVAL2020';
const HEARTBEAT_INTERVAL = 20_000; // 20 s
export const ONLINE_THRESHOLD = 60_000; // 60 s → considered online

const AuthContext = createContext<AuthContextType | null>(null);

function migrateUser(u: Partial<User>): User {
  return {
    id: u.id ?? genId(),
    username: u.username ?? '',
    password: u.password ?? '',
    email: u.email ?? '',
    bio: u.bio ?? '',
    profileIcon: u.profileIcon ?? '',
    profileImage: u.profileImage ?? '',
    bannerImage: u.bannerImage ?? '',
    following: u.following ?? [],
    lastSeen: u.lastSeen ?? 0,
    has2FA: u.has2FA ?? false,
    twoFASeed: u.twoFASeed ?? '',
    backupCodes: u.backupCodes ?? [],
    isAdmin: u.isAdmin ?? false,
    role: u.role ?? 'user',
    bannedUntil: u.bannedUntil ?? null,
  };
}

function load(): AuthState {
  try {
    // Try v4
    const v4 = localStorage.getItem(STORAGE_KEY);
    if (v4) return { ...JSON.parse(v4), users: (JSON.parse(v4).users ?? []).map(migrateUser) };
    // Migrate from v3
    const v3 = localStorage.getItem('rr_auth_v3');
    if (v3) return { ...JSON.parse(v3), users: (JSON.parse(v3).users ?? []).map(migrateUser) };
    // v2
    const v2 = localStorage.getItem('rr_auth_v2');
    if (v2) return { ...JSON.parse(v2), users: (JSON.parse(v2).users ?? []).map(migrateUser) };
  } catch {}
  return { users: [], currentUserId: null, pending2FAUserId: null };
}

function save(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function genId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getTOTPCode(seed: string): string {
  try {
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(seed),
      digits: 6,
      period: 30,
      algorithm: 'SHA1',
    });
    return totp.generate();
  } catch {
    return '------';
  }
}

function getEmailCode(userId: string): string {
  const bucket = Math.floor(Date.now() / 3600000);
  let hash = 0;
  const combined = 'email:' + userId + ':' + bucket;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
  }
  return String(Math.abs(hash) % 1000000).padStart(6, '0');
}

function generateSeed(): string {
  // Must be valid base32 (A-Z, 2-7) for TOTP compatibility with Google Authenticator / Authy
  const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  let bits = 0, value = 0, output = '';
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32[(value << (5 - bits)) & 31];
  return output;
}

function generateBackupCodes(): string[] {
  return Array.from({ length: 8 }, () =>
    Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}

function isBanned(user: User): boolean {
  if (user.bannedUntil === null) return false;
  if (user.bannedUntil === -1) return true;
  return Date.now() < user.bannedUntil;
}

export function isOnline(user: User): boolean {
  return Date.now() - user.lastSeen < ONLINE_THRESHOLD;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(load);
  useEffect(() => { save(state); }, [state]);

  // ── Online presence heartbeat ──────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      setState(s => {
        if (!s.currentUserId) return s;
        const now = Date.now();
        return {
          ...s,
          users: s.users.map(u => u.id === s.currentUserId ? { ...u, lastSeen: now } : u),
        };
      });
    };
    tick(); // immediate
    const id = setInterval(tick, HEARTBEAT_INTERVAL);
    return () => clearInterval(id);
  }, []); // runs once; setState reads currentUserId via functional update

  const currentUser = state.users.find(u => u.id === state.currentUserId) ?? null;
  const pending2FAUser = state.users.find(u => u.id === state.pending2FAUserId) ?? null;
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL || currentUser?.isAdmin === true;

  const signUp = useCallback((username: string, password: string, email: string) => {
    const s = load();
    if (!username.trim() || !password.trim() || !email.trim())
      return { success: false, error: 'All fields are required.' };
    if (s.users.some(u => u.username.toLowerCase() === username.toLowerCase()))
      return { success: false, error: 'Username already taken.' };
    if (s.users.some(u => u.email.toLowerCase() === email.toLowerCase()))
      return { success: false, error: 'Email already registered.' };
    const newUser: User = {
      id: genId(),
      username: username.trim(),
      password,
      email: email.trim(),
      bio: '',
      profileIcon: '',
      profileImage: '',
      following: [],
      lastSeen: Date.now(),
      has2FA: false,
      twoFASeed: '',
      backupCodes: [],
      isAdmin: s.users.length === 0 || email.trim() === SUPER_ADMIN_EMAIL,
      role: email.trim() === SUPER_ADMIN_EMAIL ? 'owner' : 'user',
      bannedUntil: null,
    };
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
    return { success: true };
  }, []);

  const signIn = useCallback((username: string, password: string) => {
    const s = load();
    const user = s.users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!user) return { success: false, error: 'Invalid username or password.' };
    if (isBanned(user)) {
      const msg = user.bannedUntil === -1
        ? 'Your account has been permanently banned.'
        : `You are banned until ${new Date(user.bannedUntil!).toLocaleString()}.`;
      return { success: false, error: msg };
    }
    if (user.has2FA) {
      setState(prev => ({ ...prev, pending2FAUserId: user.id }));
      return { success: true, needs2FA: true };
    }
    setState(prev => ({ ...prev, currentUserId: user.id, pending2FAUserId: null }));
    return { success: true };
  }, []);

  const verify2FA = useCallback((code: string) => {
    if (!pending2FAUser) return { success: false, error: 'No pending authentication.' };
    if (code.trim() === getTOTPCode(pending2FAUser.twoFASeed)) {
      setState(s => ({ ...s, currentUserId: pending2FAUser.id, pending2FAUserId: null }));
      return { success: true };
    }
    return { success: false, error: 'Invalid code. Please try again.' };
  }, [pending2FAUser]);

  const useBackupCode = useCallback((code: string) => {
    if (!pending2FAUser) return { success: false, error: 'No pending authentication.' };
    const idx = pending2FAUser.backupCodes.findIndex(c => c.toUpperCase() === code.toUpperCase().trim());
    if (idx === -1) return { success: false, error: 'Invalid backup code.' };
    setState(s => ({
      ...s,
      currentUserId: pending2FAUser.id,
      pending2FAUserId: null,
      users: s.users.map(u => u.id === pending2FAUser.id
        ? { ...u, backupCodes: u.backupCodes.filter((_, i) => i !== idx) }
        : u),
    }));
    return { success: true };
  }, [pending2FAUser]);

  const signOut = useCallback(() => {
    setState(s => ({ ...s, currentUserId: null, pending2FAUserId: null }));
  }, []);

  const updateUser = useCallback((updates: Partial<Pick<User, 'username' | 'password' | 'email' | 'bio' | 'isAdmin' | 'profileIcon' | 'profileImage' | 'bannerImage'>>) => {
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === s.currentUserId ? { ...u, ...updates } : u),
    }));
  }, []);

  const deleteAccount = useCallback(() => {
    setState(s => ({
      users: s.users.filter(u => u.id !== s.currentUserId),
      currentUserId: null,
      pending2FAUserId: null,
    }));
  }, []);

  const enable2FA = useCallback(() => ({ seed: generateSeed(), backupCodes: generateBackupCodes() }), []);

  const confirm2FAEnable = useCallback((seed: string, backupCodes: string[], code: string) => {
    if (code.trim() !== getTOTPCode(seed)) return { success: false, error: 'Code did not match. Try again.' };
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === s.currentUserId ? { ...u, has2FA: true, twoFASeed: seed, backupCodes } : u),
    }));
    return { success: true };
  }, []);

  const disable2FA = useCallback(() => {
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === s.currentUserId ? { ...u, has2FA: false, twoFASeed: '', backupCodes: [] } : u),
    }));
  }, []);

  const disableUser2FA = useCallback((userId: string) => {
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === userId ? { ...u, has2FA: false, twoFASeed: '', backupCodes: [] } : u),
    }));
  }, []);

  const claimAdmin = useCallback((code: string) => {
    if (code.trim() !== ADMIN_CODE) return false;
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === s.currentUserId ? { ...u, isAdmin: true } : u),
    }));
    return true;
  }, []);

  // ── Follow / subscribe ─────────────────────────────────────────────────────
  const subscribe = useCallback((targetId: string) => {
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === s.currentUserId
        ? { ...u, following: u.following.includes(targetId) ? u.following : [...u.following, targetId] }
        : u),
    }));
  }, []);

  const unsubscribe = useCallback((targetId: string) => {
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === s.currentUserId
        ? { ...u, following: u.following.filter(id => id !== targetId) }
        : u),
    }));
  }, []);

  const isFollowing = useCallback((targetId: string) => {
    return currentUser?.following.includes(targetId) ?? false;
  }, [currentUser]);

  const getFollowerCount = useCallback((targetId: string) => {
    return state.users.filter(u => u.following.includes(targetId)).length;
  }, [state.users]);

  // ── Admin ──────────────────────────────────────────────────────────────────
  const setUserRole = useCallback((userId: string, role: UserRole) => {
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === userId ? { ...u, role } : u),
    }));
  }, []);

  const banUser = useCallback((userId: string, durationMs: number | null) => {
    const bannedUntil = durationMs === null ? -1 : Date.now() + durationMs;
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === userId ? { ...u, bannedUntil } : u),
    }));
  }, []);

  const unbanUser = useCallback((userId: string) => {
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === userId ? { ...u, bannedUntil: null } : u),
    }));
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setState(s => ({
      ...s,
      users: s.users.filter(u => u.id !== userId),
      currentUserId: s.currentUserId === userId ? null : s.currentUserId,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{
      users: state.users,
      currentUser,
      pending2FAUser,
      isSuperAdmin,
      signUp, signIn, verify2FA, useBackupCode, signOut,
      updateUser, deleteAccount,
      enable2FA, confirm2FAEnable, disable2FA, disableUser2FA, claimAdmin,
      getTOTPCode, getEmailCode,
      subscribe, unsubscribe, isFollowing, getFollowerCount,
      setUserRole, banUser, unbanUser, deleteUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { getTOTPCode, getEmailCode, SUPER_ADMIN_EMAIL };
