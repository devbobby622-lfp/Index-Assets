import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type UserRole = 'user' | 'mod' | 'owner';

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  bio: string;
  profileIcon: string;      // emoji or '' for initials
  has2FA: boolean;
  twoFASeed: string;
  backupCodes: string[];
  isAdmin: boolean;
  role: UserRole;
  bannedUntil: number | null; // unix ms timestamp; -1 = permanent; null = not banned
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
  updateUser: (updates: Partial<Pick<User, 'username' | 'password' | 'email' | 'bio' | 'isAdmin' | 'profileIcon'>>) => void;
  deleteAccount: () => void;
  enable2FA: () => { seed: string; backupCodes: string[] };
  confirm2FAEnable: (seed: string, backupCodes: string[], code: string) => { success: boolean; error?: string };
  disable2FA: () => void;
  claimAdmin: (code: string) => boolean;
  getTOTPCode: (seed: string) => string;
  getEmailCode: (userId: string) => string;
  // Admin ops
  setUserRole: (userId: string, role: UserRole) => void;
  banUser: (userId: string, durationMs: number | null) => void;  // null = permanent
  unbanUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
}

const STORAGE_KEY = 'rr_auth_v3';
const ADMIN_CODE = 'REVIVAL2020';

const AuthContext = createContext<AuthContextType | null>(null);

function migrateUser(u: Partial<User>): User {
  return {
    id: u.id ?? genId(),
    username: u.username ?? '',
    password: u.password ?? '',
    email: u.email ?? '',
    bio: u.bio ?? '',
    profileIcon: u.profileIcon ?? '',
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        users: (parsed.users ?? []).map(migrateUser),
      };
    }
    // Try migrating from old key
    const old = localStorage.getItem('rr_auth_v2');
    if (old) {
      const parsed = JSON.parse(old);
      return {
        ...parsed,
        users: (parsed.users ?? []).map(migrateUser),
      };
    }
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
  const bucket = Math.floor(Date.now() / 30000);
  let hash = 0;
  const combined = seed + ':' + bucket;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
  }
  return String(Math.abs(hash) % 1000000).padStart(6, '0');
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
  return (Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)).toUpperCase();
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(load);
  useEffect(() => { save(state); }, [state]);

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

  const updateUser = useCallback((updates: Partial<Pick<User, 'username' | 'password' | 'email' | 'bio' | 'isAdmin' | 'profileIcon'>>) => {
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

  const claimAdmin = useCallback((code: string) => {
    if (code.trim() !== ADMIN_CODE) return false;
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === s.currentUserId ? { ...u, isAdmin: true } : u),
    }));
    return true;
  }, []);

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
      enable2FA, confirm2FAEnable, disable2FA, claimAdmin,
      getTOTPCode, getEmailCode,
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
