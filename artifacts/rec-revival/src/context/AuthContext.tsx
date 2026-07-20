import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  bio: string;
  has2FA: boolean;
  twoFASeed: string;
  backupCodes: string[];
  isAdmin: boolean;
}

interface AuthState {
  users: User[];
  currentUserId: string | null;
  pending2FAUserId: string | null;
}

interface AuthContextType {
  users: User[];
  currentUser: User | null;
  pending2FAUser: User | null;
  signUp: (username: string, password: string, email: string) => { success: boolean; error?: string };
  signIn: (username: string, password: string) => { success: boolean; needs2FA?: boolean; error?: string };
  verify2FA: (code: string) => { success: boolean; error?: string };
  useBackupCode: (code: string) => { success: boolean; error?: string };
  signOut: () => void;
  updateUser: (updates: Partial<Pick<User, 'username' | 'password' | 'email' | 'bio' | 'isAdmin'>>) => void;
  deleteAccount: () => void;
  enable2FA: () => { seed: string; backupCodes: string[] };
  confirm2FAEnable: (seed: string, backupCodes: string[], code: string) => { success: boolean; error?: string };
  disable2FA: () => void;
  claimAdmin: (code: string) => boolean;
  getTOTPCode: (seed: string) => string;
  getEmailCode: (userId: string) => string;
}

const STORAGE_KEY = 'rr_auth_v2';
const ADMIN_CODE = 'REVIVAL2020';

const AuthContext = createContext<AuthContextType | null>(null);

function load(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { users: [], currentUserId: null, pending2FAUserId: null };
}

function save(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  const bucket = Math.floor(Date.now() / 3600000); // hourly bucket
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
    Math.random().toString(36).substring(2, 6).toUpperCase() +
    '-' +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(load);

  useEffect(() => { save(state); }, [state]);

  const currentUser = state.users.find(u => u.id === state.currentUserId) ?? null;
  const pending2FAUser = state.users.find(u => u.id === state.pending2FAUserId) ?? null;

  const signUp = useCallback((username: string, password: string, email: string) => {
    if (!username.trim() || !password.trim() || !email.trim())
      return { success: false, error: 'All fields are required.' };
    if (state.users.some(u => u.username.toLowerCase() === username.toLowerCase()))
      return { success: false, error: 'Username already taken.' };
    if (state.users.some(u => u.email.toLowerCase() === email.toLowerCase()))
      return { success: false, error: 'Email already registered.' };
    const newUser: User = {
      id: crypto.randomUUID(),
      username: username.trim(),
      password,
      email: email.trim(),
      bio: '',
      has2FA: false,
      twoFASeed: '',
      backupCodes: [],
      isAdmin: state.users.length === 0, // first user is admin
    };
    setState(s => ({ ...s, users: [...s.users, newUser] }));
    return { success: true };
  }, [state.users]);

  const signIn = useCallback((username: string, password: string) => {
    const user = state.users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!user) return { success: false, error: 'Invalid username or password.' };
    if (user.has2FA) {
      setState(s => ({ ...s, pending2FAUserId: user.id }));
      return { success: true, needs2FA: true };
    }
    setState(s => ({ ...s, currentUserId: user.id, pending2FAUserId: null }));
    return { success: true };
  }, [state.users]);

  const verify2FA = useCallback((code: string) => {
    if (!pending2FAUser) return { success: false, error: 'No pending authentication.' };
    const expected = getTOTPCode(pending2FAUser.twoFASeed);
    if (code.trim() === expected) {
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
      users: s.users.map(u =>
        u.id === pending2FAUser.id
          ? { ...u, backupCodes: u.backupCodes.filter((_, i) => i !== idx) }
          : u
      ),
    }));
    return { success: true };
  }, [pending2FAUser]);

  const signOut = useCallback(() => {
    setState(s => ({ ...s, currentUserId: null, pending2FAUserId: null }));
  }, []);

  const updateUser = useCallback((updates: Partial<Pick<User, 'username' | 'password' | 'email' | 'bio' | 'isAdmin'>>) => {
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

  const enable2FA = useCallback(() => {
    const seed = generateSeed();
    const codes = generateBackupCodes();
    return { seed, backupCodes: codes };
  }, []);

  const confirm2FAEnable = useCallback((seed: string, backupCodes: string[], code: string) => {
    const expected = getTOTPCode(seed);
    if (code.trim() !== expected) return { success: false, error: 'Code did not match. Try again.' };
    setState(s => ({
      ...s,
      users: s.users.map(u =>
        u.id === s.currentUserId
          ? { ...u, has2FA: true, twoFASeed: seed, backupCodes }
          : u
      ),
    }));
    return { success: true };
  }, []);

  const disable2FA = useCallback(() => {
    setState(s => ({
      ...s,
      users: s.users.map(u =>
        u.id === s.currentUserId
          ? { ...u, has2FA: false, twoFASeed: '', backupCodes: [] }
          : u
      ),
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

  return (
    <AuthContext.Provider value={{
      users: state.users,
      currentUser,
      pending2FAUser,
      signUp,
      signIn,
      verify2FA,
      useBackupCode,
      signOut,
      updateUser,
      deleteAccount,
      enable2FA,
      confirm2FAEnable,
      disable2FA,
      claimAdmin,
      getTOTPCode,
      getEmailCode,
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
