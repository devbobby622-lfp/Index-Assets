import { Link, useLocation } from 'wouter';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Settings, ChevronDown, ShieldCheck } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/have-fun', label: 'Have Fun' },
  { href: '/support', label: 'Support & Recagain archive' },
  { href: '/settings', label: 'Settings' },
];

export default function Nav() {
  const [location] = useLocation();
  const { currentUser, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav
      className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-border"
      style={{ backgroundColor: 'var(--nav-bg)' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-85 transition-opacity">
          <img
            src={`${import.meta.env.BASE_URL}recroom-logo.png`}
            alt="Rec Room Revival"
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rr-tab ${location === href ? 'rr-tab-active' : 'rr-tab-inactive'}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="flex items-center gap-2 bg-card border border-border rounded-full pl-3 pr-2.5 py-1.5 text-sm font-bold hover:border-primary/50 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-black">
                  {currentUser.username[0].toUpperCase()}
                </span>
                <span className="max-w-[100px] truncate">{currentUser.username}</span>
                {currentUser.isAdmin && (
                  <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-2xl overflow-hidden"
                  style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.35)' }}
                >
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-muted transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    Settings
                  </Link>
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-muted transition-colors text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="bg-card border border-border text-foreground px-4 py-2 rounded-full text-sm font-bold hover:border-primary/50 transition-colors"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/instructions"
            className="bg-primary text-white px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ boxShadow: '0 4px 12px rgba(255,85,51,0.3)' }}
          >
            Play Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
