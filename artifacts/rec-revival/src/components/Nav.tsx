import { Link, useLocation } from 'wouter';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/have-fun', label: 'Have Fun' },
  { href: '/support', label: 'Support & Recagain archive' },
  { href: '/settings', label: 'Settings' },
];

export default function Nav() {
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-border" style={{ backgroundColor: 'var(--nav-bg)' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <span className="text-xl font-black text-primary tracking-tight">Rec Room Revival</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-2">
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

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/instructions"
            className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
            style={{ boxShadow: '0 4px 12px rgba(255,85,51,0.3)' }}
          >
            Play Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
